import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from '../firebase';
import { FoodProduct, ProductOffer, OfferMessage, ProductStatus, DurationDays } from '../types';

/**
 * Convierte timestamps de Firestore u otros formatos de fecha a string ISO 8601 estándar.
 */
function toIsoDate(val: unknown, fallback: string = new Date().toISOString()): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (val instanceof Date) return val.toISOString();
  return fallback;
}

// ============================================================================
// 1. MÓDULO DE PRODUCTOS (Publicaciones Reales y Compartidas en Firestore)
// ============================================================================

/**
 * Suscripción en tiempo real al catálogo completo de productos en Firestore.
 * Notifica automáticamente a todos los clientes conectados cuando un producto se publica, modifica, pausa o vende.
 */
export function subscribeToProducts(
  onUpdate: (products: FoodProduct[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    onUpdate([]);
    return () => {};
  }

  const productsRef = collection(db, 'products');

  return onSnapshot(
    productsRef,
    (snapshot) => {
      const list: FoodProduct[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name || '',
          category: d.category || 'Otros alimentos',
          brand: d.brand || '',
          description: d.description || '',
          imageUrl: d.imageUrl || '',
          images: Array.isArray(d.images) ? d.images : d.imageUrl ? [d.imageUrl] : [],
          quantity: Number(d.quantity) || 0,
          unit: d.unit || 'kg',
          condition: d.condition || 'Excelente estado / Lote excedente',
          expirationDate: d.expirationDate || '',
          recommendedConsumptionDate: d.recommendedConsumptionDate || undefined,
          locationCity: d.locationCity || 'Medellín',
          locationAddress: d.locationAddress || '',
          comuna: d.comuna || 'Comuna 8 — Villa Hermosa, Medellín',
          barrio: d.barrio || 'Villa Hermosa',
          locationReference: d.locationReference || '',
          coordinates: d.coordinates || undefined,
          placeId: d.placeId || undefined,
          requestedPrice: Number(d.requestedPrice) || 0,
          originalPrice: Number(d.originalPrice) || Number(d.requestedPrice) || 0,
          minPurchaseQuantity: Number(d.minPurchaseQuantity) || 1,
          deliveryConditions: d.deliveryConditions || '',
          durationDays: d.durationDays as DurationDays | undefined,
          commissionPaid: Number(d.commissionPaid) || 0,
          publishedAt: toIsoDate(d.publishedAt || d.createdAt),
          expiresAt: toIsoDate(d.expiresAt),
          status: (d.status || 'activa') as ProductStatus,
          sellerId: d.sellerId || '',
          sellerName: d.sellerName || 'Vendedor Solidario',
          sellerType: d.sellerType || 'Supermercado',
          sellerVerified: Boolean(d.sellerVerified),
          sellerPhone: d.sellerPhone || undefined,
          offersCount: Number(d.offersCount) || 0,
          viewsCount: Number(d.viewsCount) || 0,
        });
      });

      // Ordenar por fecha de publicación descendente (más recientes primero)
      list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn('Notice from Firestore products onSnapshot:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Publica un nuevo lote de producto directamente en Cloud Firestore.
 */
export async function createProductInFirestore(
  productData: Omit<
    FoodProduct,
    'id' | 'publishedAt' | 'expiresAt' | 'status' | 'commissionPaid' | 'offersCount' | 'viewsCount'
  >,
  seller: { id: string; name: string; type?: string; verified?: boolean }
): Promise<FoodProduct> {
  const newProductRef = doc(collection(db, 'products'));
  const now = new Date();

  let expiresAtIso: string;
  if (productData.expirationDate) {
    expiresAtIso = new Date(`${productData.expirationDate}T23:59:59.999Z`).toISOString();
  } else {
    const fallbackDays = productData.durationDays || 30;
    expiresAtIso = new Date(now.getTime() + fallbackDays * 24 * 60 * 60 * 1000).toISOString();
  }

  const payload = {
    id: newProductRef.id,
    name: productData.name.trim(),
    category: productData.category,
    brand: productData.brand?.trim() || '',
    description: productData.description.trim(),
    imageUrl: productData.imageUrl,
    images: productData.images && productData.images.length > 0 ? productData.images : [productData.imageUrl],
    quantity: Number(productData.quantity) || 0,
    unit: productData.unit,
    condition: productData.condition,
    expirationDate: productData.expirationDate,
    recommendedConsumptionDate: productData.recommendedConsumptionDate || '',
    locationCity: 'Medellín',
    locationAddress: productData.locationAddress,
    comuna: 'Comuna 8 — Villa Hermosa, Medellín',
    barrio: productData.barrio || 'Villa Hermosa',
    locationReference: productData.locationReference?.trim() || '',
    coordinates: productData.coordinates || null,
    placeId: productData.placeId || '',
    requestedPrice: Number(productData.requestedPrice) || 0,
    originalPrice: Number(productData.originalPrice) || Number(productData.requestedPrice) || 0,
    minPurchaseQuantity: Number(productData.minPurchaseQuantity) || 1,
    deliveryConditions: productData.deliveryConditions?.trim() || '',
    durationDays: productData.durationDays || 30,
    commissionPaid: 0,
    publishedAt: now.toISOString(),
    expiresAt: expiresAtIso,
    status: 'activa',
    sellerId: seller.id,
    sellerName: seller.name,
    sellerType: seller.type || 'Supermercado',
    sellerVerified: Boolean(seller.verified),
    offersCount: 0,
    viewsCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(newProductRef, payload);
    return {
      ...payload,
      coordinates: productData.coordinates,
      images: payload.images,
      status: 'activa',
    } as FoodProduct;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `products/${newProductRef.id}`);
  }
}

/**
 * Actualiza el estado de una publicación (activa, pausada, vendida, finalizada).
 */
export async function updateProductStatusInFirestore(
  productId: string,
  status: ProductStatus
): Promise<void> {
  const prodRef = doc(db, 'products', productId);
  try {
    await updateDoc(prodRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
  }
}

/**
 * Incrementa el contador de vistas de un producto en el catálogo.
 */
export async function incrementProductViewsInFirestore(productId: string): Promise<void> {
  if (!isFirebaseConfigured || !db || !productId) return;
  const prodRef = doc(db, 'products', productId);
  try {
    await updateDoc(prodRef, {
      viewsCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Lectura de vista silenciosa
  }
}

// ============================================================================
// 2. MÓDULO DE NEGOCIACIONES Y CHAT EN TIEMPO REAL (Conversaciones y Mensajes)
// ============================================================================

/**
 * Suscripción en tiempo real a las conversaciones del usuario autenticado (comprador o vendedor).
 */
export function subscribeToUserConversations(
  userId: string,
  onUpdate: (offers: ProductOffer[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db || !userId) {
    onUpdate([]);
    return () => {};
  }

  const convsRef = collection(db, 'conversations');
  const q = query(convsRef, where('participants', 'array-contains', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ProductOffer[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          productId: d.productId || '',
          productName: d.productName || '',
          productImageUrl: d.productImageUrl || '',
          sellerId: d.sellerId || '',
          sellerName: d.sellerName || '',
          buyerId: d.buyerId || '',
          buyerName: d.buyerName || '',
          buyerOrganization: d.buyerOrganization || d.buyerName || '',
          buyerType: d.buyerType || 'Fundación',
          requestedQuantity: Number(d.requestedQuantity) || 0,
          offeredPricePerUnit: Number(d.offeredPricePerUnit) || 0,
          totalOfferedPrice: Number(d.totalOfferedPrice) || 0,
          unit: d.unit || 'kg',
          message: d.lastMessageText || '',
          pickupMethod: d.pickupMethod || 'Recogida en sede del vendedor',
          proposedDate: d.proposedDate || '',
          status: d.status || 'pendiente',
          createdAt: toIsoDate(d.createdAt),
          updatedAt: toIsoDate(d.updatedAt || d.lastMessageAt),
          messages: [], // Los mensajes se cargan en tiempo real vía subcolección para la conversación activa
        });
      });

      // Ordenar por fecha de última actividad descendente
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn('Notice from Firestore conversations onSnapshot:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Suscripción en tiempo real a los mensajes de una conversación específica.
 */
export function subscribeToConversationMessages(
  conversationId: string,
  onUpdate: (messages: OfferMessage[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db || !conversationId) {
    onUpdate([]);
    return () => {};
  }

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: OfferMessage[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        msgs.push({
          id: docSnap.id,
          senderId: d.senderId || '',
          senderName: d.senderName || '',
          senderRole: d.senderRole || 'buyer',
          timestamp: toIsoDate(d.createdAt).replace('T', ' ').slice(0, 16),
          text: d.text || '',
          isOfferProposal: d.type === 'offer' || d.type === 'counteroffer',
          proposedPrice: d.proposedPrice ? Number(d.proposedPrice) : undefined,
          proposedQuantity: d.proposedQuantity ? Number(d.proposedQuantity) : undefined,
          type: d.type || 'message',
          status: d.status || undefined,
        });
      });
      onUpdate(msgs);
    },
    (error) => {
      console.warn('Notice from Firestore messages onSnapshot:', error);
      if (onError) onError(error);
    }
  );
}

export interface CreateConversationParams {
  productId: string;
  productName: string;
  productImageUrl: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerOrganization: string;
  buyerType?: string;
  requestedQuantity: number;
  offeredPricePerUnit: number;
  totalOfferedPrice: number;
  unit: string;
  message?: string;
  pickupMethod?: 'Recogida en sede del vendedor' | 'Transporte solidario contratado' | 'Envío acordado';
  proposedDate?: string;
}

/**
 * Busca si ya existe una conversación entre el comprador y el vendedor para este producto.
 * Si ya existe, la recupera y evita duplicados innecesarios.
 * Si no existe, crea la conversación y el primer mensaje formal de oferta en Firestore.
 */
export async function getOrCreateConversationInFirestore(
  params: CreateConversationParams
): Promise<{ conversationId: string; isNew: boolean }> {
  const convsRef = collection(db, 'conversations');

  // Buscar conversación previa idéntica
  try {
    const existingQuery = query(
      convsRef,
      where('productId', '==', params.productId),
      where('buyerId', '==', params.buyerId)
    );
    const existingSnap = await getDocs(existingQuery);

    if (!existingSnap.empty) {
      const existingDoc = existingSnap.docs[0];
      const conversationId = existingDoc.id;

      // Si se envió un nuevo mensaje u oferta, registrarlo en la conversación existente
      if (params.message && params.message.trim()) {
        await sendMessageInFirestore(conversationId, {
          senderId: params.buyerId,
          senderName: params.buyerName,
          senderRole: 'buyer',
          text: params.message.trim(),
          isProposal: true,
          proposedPrice: params.offeredPricePerUnit,
          proposedQuantity: params.requestedQuantity,
          unit: params.unit,
        });
      }

      return { conversationId, isNew: false };
    }
  } catch (err) {
    console.warn('Error checking existing conversation, proceeding to create:', err);
  }

  // Crear nueva conversación
  const newConvRef = doc(convsRef);
  const conversationId = newConvRef.id;
  const initialText =
    params.message?.trim() ||
    `Hola, me interesa este lote de "${params.productName}". Deseo ofertar $${params.offeredPricePerUnit.toLocaleString('es-CO')} por ${params.unit} para ${params.requestedQuantity} ${params.unit}.`;

  const convPayload = {
    id: conversationId,
    productId: params.productId,
    productName: params.productName,
    productImageUrl: params.productImageUrl || '',
    sellerId: params.sellerId,
    sellerName: params.sellerName,
    buyerId: params.buyerId,
    buyerName: params.buyerName,
    buyerOrganization: params.buyerOrganization || params.buyerName,
    buyerType: params.buyerType || 'Fundación',
    participants: [params.buyerId, params.sellerId],
    status: 'pendiente',
    requestedQuantity: params.requestedQuantity,
    offeredPricePerUnit: params.offeredPricePerUnit,
    totalOfferedPrice: params.totalOfferedPrice,
    unit: params.unit,
    pickupMethod: params.pickupMethod || 'Recogida en sede del vendedor',
    proposedDate: params.proposedDate || '',
    lastMessageText: initialText,
    lastMessageAt: new Date().toISOString(),
    lastMessageSenderId: params.buyerId,
    unreadCountBuyer: 0,
    unreadCountSeller: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(newConvRef, convPayload);

    // Incrementar offersCount en el producto
    const prodRef = doc(db, 'products', params.productId);
    updateDoc(prodRef, {
      offersCount: increment(1),
      updatedAt: serverTimestamp(),
    }).catch(() => {});

    // Crear el primer mensaje en la subcolección
    const firstMsgRef = doc(collection(db, 'conversations', conversationId, 'messages'));
    await setDoc(firstMsgRef, {
      id: firstMsgRef.id,
      conversationId,
      senderId: params.buyerId,
      senderName: params.buyerName,
      senderRole: 'buyer',
      text: initialText,
      type: 'offer',
      proposedPrice: params.offeredPricePerUnit,
      proposedQuantity: params.requestedQuantity,
      unit: params.unit,
      read: false,
      createdAt: serverTimestamp(),
    });

    return { conversationId, isNew: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `conversations/${conversationId}`);
  }
}

/**
 * Envía un mensaje de texto u oferta dentro de una conversación en Firestore.
 */
export async function sendMessageInFirestore(
  conversationId: string,
  params: {
    senderId: string;
    senderName: string;
    senderRole: 'buyer' | 'seller';
    text: string;
    isProposal?: boolean;
    proposedPrice?: number;
    proposedQuantity?: number;
    unit?: string;
  }
): Promise<void> {
  const msgRef = doc(collection(db, 'conversations', conversationId, 'messages'));
  const convRef = doc(db, 'conversations', conversationId);

  const msgType = params.isProposal ? 'counteroffer' : 'text';

  try {
    // 1. Guardar mensaje en la subcolección
    await setDoc(msgRef, {
      id: msgRef.id,
      conversationId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderRole: params.senderRole,
      text: params.text.trim(),
      type: msgType,
      proposedPrice: params.proposedPrice || null,
      proposedQuantity: params.proposedQuantity || null,
      unit: params.unit || '',
      read: false,
      createdAt: serverTimestamp(),
    });

    // 2. Actualizar el documento de conversación
    const convUpdates: Record<string, unknown> = {
      lastMessageText: params.text.trim(),
      lastMessageAt: new Date().toISOString(),
      lastMessageSenderId: params.senderId,
      updatedAt: serverTimestamp(),
    };

    if (params.isProposal && params.proposedPrice && params.proposedQuantity) {
      convUpdates.status = 'contraoferta';
      convUpdates.offeredPricePerUnit = params.proposedPrice;
      convUpdates.requestedQuantity = params.proposedQuantity;
      convUpdates.totalOfferedPrice = params.proposedPrice * params.proposedQuantity;
    } else {
      // Si estaba en 'pendiente' y se envía un mensaje de texto ordinario, pasar a 'en_conversacion'
      convUpdates.status = 'en_conversacion';
    }

    if (params.senderRole === 'buyer') {
      convUpdates.unreadCountSeller = increment(1);
    } else {
      convUpdates.unreadCountBuyer = increment(1);
    }

    await updateDoc(convRef, convUpdates);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `conversations/${conversationId}/messages`);
  }
}

/**
 * Responde formalmente a una oferta en Firestore: aceptar, rechazar o proponer contraoferta.
 */
export async function respondToOfferInFirestore(
  conversationId: string,
  status: 'aceptada' | 'rechazada' | 'contraoferta',
  user: { id: string; name: string; role: 'buyer' | 'seller' },
  counterPrice?: number,
  counterQuantity?: number,
  counterMessage?: string
): Promise<void> {
  const convRef = doc(db, 'conversations', conversationId);

  try {
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists()) return;
    const convData = convSnap.data();

    let messageText = '';
    let msgType: 'acceptance' | 'rejection' | 'counteroffer' = 'acceptance';

    if (status === 'aceptada') {
      messageText = '¡Oferta ACEPTADA! Acordamos los términos solidarios. Procedamos a coordinar la entrega y logística de recogida.';
      msgType = 'acceptance';
    } else if (status === 'rechazada') {
      messageText = 'Oferta no aceptada. Gracias por tu interés; en este momento no es posible concretar en estas condiciones.';
      msgType = 'rejection';
    } else if (status === 'contraoferta') {
      messageText =
        counterMessage ||
        `Contraoferta propuesta: $${counterPrice?.toLocaleString('es-CO')} por ${convData.unit} (${counterQuantity} ${convData.unit}).`;
      msgType = 'counteroffer';
    }

    // 1. Crear mensaje en la subcolección
    const msgRef = doc(collection(db, 'conversations', conversationId, 'messages'));
    await setDoc(msgRef, {
      id: msgRef.id,
      conversationId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      text: messageText,
      type: msgType,
      proposedPrice: counterPrice || null,
      proposedQuantity: counterQuantity || null,
      unit: convData.unit || 'kg',
      read: false,
      createdAt: serverTimestamp(),
    });

    // 2. Actualizar conversación
    const updates: Record<string, unknown> = {
      status,
      lastMessageText: messageText,
      lastMessageAt: new Date().toISOString(),
      lastMessageSenderId: user.id,
      updatedAt: serverTimestamp(),
    };

    if (status === 'contraoferta' && counterPrice && counterQuantity) {
      updates.offeredPricePerUnit = counterPrice;
      updates.requestedQuantity = counterQuantity;
      updates.totalOfferedPrice = counterPrice * counterQuantity;
    }

    await updateDoc(convRef, updates);

    // 3. Si la oferta fue aceptada, actualizar el producto en el catálogo a 'vendida'
    if (status === 'aceptada' && convData.productId) {
      updateProductStatusInFirestore(convData.productId, 'vendida').catch(() => {});
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `conversations/${conversationId}`);
  }
}

/**
 * Marca los mensajes de una conversación como leídos por el usuario actual.
 */
export async function markConversationAsReadInFirestore(
  conversationId: string,
  userRole: 'buyer' | 'seller'
): Promise<void> {
  if (!isFirebaseConfigured || !db || !conversationId) return;
  const convRef = doc(db, 'conversations', conversationId);
  try {
    const updateField = userRole === 'seller' ? 'unreadCountSeller' : 'unreadCountBuyer';
    await updateDoc(convRef, {
      [updateField]: 0,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Silencioso
  }
}
