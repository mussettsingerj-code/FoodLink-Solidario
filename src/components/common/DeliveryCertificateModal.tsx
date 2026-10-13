import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { ProductOffer } from '../../types';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../data/initialData';
import { PARTNER_ORGANIZATIONS } from '../../data/demoData';
import {
  X,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Building2,
  Package,
  Truck,
  ShieldCheck,
  Eye,
} from 'lucide-react';

interface DeliveryCertificateModalProps {
  offer: ProductOffer | null;
  onClose: () => void;
}

interface PartyDetails {
  organizationName: string;
  contactName: string;
  roleOrType: string;
  nit: string;
  phone: string;
  email: string;
  city: string;
  address: string;
}

async function loadLogoBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 240;
        canvas.height = img.naturalHeight || 80;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export const DeliveryCertificateModal: React.FC<DeliveryCertificateModalProps> = ({
  offer,
  onClose,
}) => {
  const { products, currentUser, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'document' | 'pdf_embed'>('document');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Guard: Only Accepted operations can generate a Delivery Certificate
  const isEligible = Boolean(offer && offer.status === 'aceptada');

  const relatedProduct = useMemo(() => {
    if (!offer) return undefined;
    return products.find((p) => p.id === offer.productId);
  }, [offer, products]);

  // Resolve real Seller (Publisher) data without inventing fields
  const sellerDetails: PartyDetails = useMemo(() => {
    if (!offer) {
      return {
        organizationName: '',
        contactName: '',
        roleOrType: '',
        nit: '',
        phone: '',
        email: '',
        city: '',
        address: '',
      };
    }

    const partner = PARTNER_ORGANIZATIONS.find(
      (org) => org.id === offer.sellerId || org.name === offer.sellerName
    );
    const mockUser = Object.values(MOCK_USERS).find((u) => u.id === offer.sellerId);
    const isCurrentSeller = currentUser && currentUser.id === offer.sellerId;

    return {
      organizationName: offer.sellerName,
      contactName:
        (isCurrentSeller ? currentUser.name : mockUser?.name) || offer.sellerName,
      roleOrType: relatedProduct?.sellerType || partner?.type || 'Establecimiento Publicador',
      nit:
        (isCurrentSeller ? currentUser.nitOrId : undefined) ||
        partner?.nit ||
        mockUser?.nitOrId ||
        'Registrado en plataforma',
      phone:
        relatedProduct?.sellerPhone ||
        (isCurrentSeller ? currentUser.phone : undefined) ||
        partner?.phone ||
        mockUser?.phone ||
        'No especificado',
      email:
        (isCurrentSeller ? currentUser.email : undefined) ||
        partner?.email ||
        mockUser?.email ||
        'No especificado',
      city:
        relatedProduct?.locationCity ||
        (isCurrentSeller ? currentUser.city : undefined) ||
        partner?.city ||
        mockUser?.city ||
        'Colombia',
      address:
        relatedProduct?.locationAddress ||
        partner?.address ||
        'Sede registrada del establecimiento',
    };
  }, [offer, relatedProduct, currentUser]);

  // Resolve real Buyer (Receiver) data without inventing fields
  const buyerDetails: PartyDetails = useMemo(() => {
    if (!offer) {
      return {
        organizationName: '',
        contactName: '',
        roleOrType: '',
        nit: '',
        phone: '',
        email: '',
        city: '',
        address: '',
      };
    }

    const partner = PARTNER_ORGANIZATIONS.find(
      (org) => org.id === offer.buyerId || org.name === offer.buyerOrganization
    );
    const mockUser = Object.values(MOCK_USERS).find((u) => u.id === offer.buyerId);
    const isCurrentBuyer = currentUser && currentUser.id === offer.buyerId;

    return {
      organizationName: offer.buyerOrganization,
      contactName: offer.buyerName,
      roleOrType: offer.buyerType || partner?.type || 'Organización Receptora',
      nit:
        (isCurrentBuyer ? currentUser.nitOrId : undefined) ||
        partner?.nit ||
        mockUser?.nitOrId ||
        'Registrado en plataforma',
      phone:
        (isCurrentBuyer ? currentUser.phone : undefined) ||
        partner?.phone ||
        mockUser?.phone ||
        'No especificado',
      email:
        (isCurrentBuyer ? currentUser.email : undefined) ||
        partner?.email ||
        mockUser?.email ||
        'No especificado',
      city:
        (isCurrentBuyer ? currentUser.city : undefined) ||
        partner?.city ||
        mockUser?.city ||
        sellerDetails.city,
      address: partner?.address || 'Sede de la organización receptora',
    };
  }, [offer, currentUser, sellerDetails.city]);

  const certificateNumber = offer ? `ACTA-${offer.id.toUpperCase()}` : '';
  const issueDateFormatted = useMemo(() => {
    if (!offer) return '';
    try {
      return new Date(offer.updatedAt || offer.createdAt).toLocaleString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return offer.proposedDate;
    }
  }, [offer]);

  const operationType = useMemo(() => {
    if (!offer) return '';
    return offer.totalOfferedPrice > 0
      ? 'Adquisición Solidaria de Excedentes (Aprovechamiento Alimentario)'
      : 'Entrega Solidaria sin Costo';
  }, [offer]);

  const productCategory = relatedProduct?.category || 'Alimentos para aprovechamiento';
  const productCondition = relatedProduct?.condition || 'Apto para consumo humano';
  const productExpiration = relatedProduct?.expirationDate || offer?.proposedDate || 'Vigente';
  const deliveryConditions =
    relatedProduct?.deliveryConditions ||
    'Entrega sujeta a verificación física del lote en el punto de retiro.';

  // Build the PDF document using jsPDF with real data
  const buildPdfDocument = async (): Promise<jsPDF | null> => {
    if (!offer || offer.status !== 'aceptada') return null;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;

    // Header Background Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');

    // Logo in white box
    const logoDataUrl = await loadLogoBase64('/logo.png');
    if (logoDataUrl) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin + 5, y + 5, 34, 18, 2, 2, 'F');
      doc.addImage(logoDataUrl, 'PNG', margin + 7, y + 6.5, 30, 15, undefined, 'FAST');
    } else {
      doc.setTextColor(52, 211, 153);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('PUBLIK SOLIDARIO', margin + 6, y + 16);
    }

    // Document Title & Operation Number in Header
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      'COMPROBANTE OFICIAL DE OPERACIÓN SOLIDARIA',
      pageWidth - margin - 5,
      y + 8,
      { align: 'right' }
    );

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text(
      'ACTA DE ENTREGA DE ALIMENTOS',
      pageWidth - margin - 5,
      y + 15.5,
      { align: 'right' }
    );

    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(
      `N.° Documento: ${certificateNumber}  |  ID Operación: ${offer.id}`,
      pageWidth - margin - 5,
      y + 22.5,
      { align: 'right' }
    );

    y += 34;

    // Metadata Summary Strip (Date, Operation Type, Status)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('FECHA DE REGISTRO Y ACEPTACIÓN', margin + 4, y + 6);
    doc.text('TIPO DE OPERACIÓN', margin + 68, y + 6);
    doc.text('ESTADO DE LA OPERACIÓN', pageWidth - margin - 4, y + 6, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(issueDateFormatted, margin + 4, y + 13);
    doc.text(operationType, margin + 68, y + 13, { maxWidth: 75 });

    doc.setTextColor(5, 150, 105); // emerald-600
    doc.setFont('helvetica', 'bold');
    doc.text('ACEPTADA Y VERIFICADA', pageWidth - margin - 4, y + 13, { align: 'right' });

    y += 24;

    // Two Columns: Seller (Who Publishes/Delivers) & Buyer (Who Receives/Purchases)
    const colWidth = (contentWidth - 6) / 2;
    const boxHeight = 46;

    // Left Box: Entidad que publica / entrega
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, colWidth, boxHeight, 2, 2, 'FD');

    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 0.3, y + 0.3, colWidth - 0.6, 8, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('1. DATOS DE QUIEN PUBLICA Y ENTREGA', margin + 4, y + 5.5);

    doc.setFontSize(8.5);
    doc.text(sellerDetails.organizationName, margin + 4, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Responsable: ${sellerDetails.contactName}`, margin + 4, y + 19.5);
    doc.text(`Tipo / Rol: ${sellerDetails.roleOrType}`, margin + 4, y + 24.5);
    doc.text(`NIT / ID: ${sellerDetails.nit}`, margin + 4, y + 29.5);
    doc.text(`Contacto: ${sellerDetails.phone} · ${sellerDetails.email}`, margin + 4, y + 34.5, {
      maxWidth: colWidth - 8,
    });
    doc.text(`Ubicación: ${sellerDetails.city} — ${sellerDetails.address}`, margin + 4, y + 40.5, {
      maxWidth: colWidth - 8,
    });

    // Right Box: Entidad que recibe / compra
    const rightX = margin + colWidth + 6;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(rightX, y, colWidth, boxHeight, 2, 2, 'FD');

    doc.setFillColor(241, 245, 249);
    doc.rect(rightX + 0.3, y + 0.3, colWidth - 0.6, 8, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('2. DATOS DE QUIEN RECIBE / ADQUIERE', rightX + 4, y + 5.5);

    doc.setFontSize(8.5);
    doc.text(buyerDetails.organizationName, rightX + 4, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Representante: ${buyerDetails.contactName}`, rightX + 4, y + 19.5);
    doc.text(`Tipo de Entidad: ${buyerDetails.roleOrType}`, rightX + 4, y + 24.5);
    doc.text(`NIT / ID: ${buyerDetails.nit}`, rightX + 4, y + 29.5);
    doc.text(`Contacto: ${buyerDetails.phone} · ${buyerDetails.email}`, rightX + 4, y + 34.5, {
      maxWidth: colWidth - 8,
    });
    doc.text(`Ciudad: ${buyerDetails.city} — ${buyerDetails.address}`, rightX + 4, y + 40.5, {
      maxWidth: colWidth - 8,
    });

    y += boxHeight + 7;

    // Section 3: Product Details & Operation Value
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('3. ESPECIFICACIÓN DEL LOTE DE ALIMENTOS Y VALOR ACORDADO', margin + 4, y + 5.3);

    y += 8;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 38, 'FD');

    // Product fields inside table
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PRODUCTO', margin + 4, y + 6);
    doc.text('CATEGORÍA', margin + 88, y + 6);
    doc.text('ESTADO DEL PRODUCTO', margin + 128, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(offer.productName, margin + 4, y + 12, { maxWidth: 80 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(productCategory, margin + 88, y + 12);
    doc.text(productCondition, margin + 128, y + 12, { maxWidth: 50 });

    doc.setDrawColor(241, 245, 249);
    doc.line(margin + 4, y + 17, pageWidth - margin - 4, y + 17);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('CANTIDAD ACORDADA', margin + 4, y + 23);
    doc.text('FECHA DE VENCIMIENTO LOTE', margin + 50, y + 23);
    doc.text('VALOR UNITARIO', margin + 105, y + 23);
    doc.text('VALOR TOTAL DE LA OPERACIÓN', pageWidth - margin - 4, y + 23, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`${offer.requestedQuantity} ${offer.unit}`, margin + 4, y + 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(productExpiration, margin + 50, y + 30);
    doc.text(
      `$${offer.offeredPricePerUnit.toLocaleString('es-CO')} COP / ${offer.unit}`,
      margin + 105,
      y + 30
    );

    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(
      `$${offer.totalOfferedPrice.toLocaleString('es-CO')} COP`,
      pageWidth - margin - 4,
      y + 30,
      { align: 'right' }
    );

    y += 45;

    // Section 4: Delivery & Logistics Information
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('4. INFORMACIÓN LOGÍSTICA Y CONDICIONES DE ENTREGA', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Modalidad acordada: ${offer.pickupMethod}`, margin + 4, y + 12.5);
    doc.text(`• Fecha programada de entrega/retiro: ${offer.proposedDate}`, margin + 95, y + 12.5);
    doc.text(
      `• Punto de entrega: ${sellerDetails.city} — ${sellerDetails.address}`,
      margin + 4,
      y + 18.5
    );
    doc.text(
      `• Condiciones de manipulación: ${deliveryConditions}`,
      margin + 4,
      y + 24.5,
      { maxWidth: contentWidth - 8 }
    );

    y += 40;

    // Section 5: Signatures & Confirmation of Both Parties
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('5. FIRMAS Y CONFIRMACIÓN DE CONFORMIDAD DE LAS PARTES', margin, y);

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Las partes declaran haber verificado la cantidad, estado e inocuidad visual de los alimentos descritos en el momento de su entrega física.',
      margin,
      y + 3
    );

    y += 8;
    const sigBoxHeight = 36;

    // Left signature box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, colWidth, sigBoxHeight, 2, 2, 'FD');
    doc.line(margin + 8, y + 22, margin + colWidth - 8, y + 22);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('ENTREGADO POR (ESTABLECIMIENTO)', margin + 8, y + 27);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${sellerDetails.organizationName} (${sellerDetails.nit})`,
      margin + 8,
      y + 32
    );

    // Right signature box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(rightX, y, colWidth, sigBoxHeight, 2, 2, 'FD');
    doc.line(rightX + 8, y + 22, rightX + colWidth - 8, y + 22);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('RECIBIDO A CONFORMIDAD POR (RECEPTOR)', rightX + 8, y + 27);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${buyerDetails.organizationName} — ${buyerDetails.contactName}`,
      rightX + 8,
      y + 32
    );

    y += sigBoxHeight + 8;

    // Section 6: Final Official Delivery Certificate Seal
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

    doc.setTextColor(6, 95, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(
      'CONSTANCIA Y COMPROBANTE OFICIAL DE ENTREGA — PUBLIK SOLIDARIO',
      margin + 4,
      y + 6.5
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Este documento constituye el comprobante oficial de entrega y trazabilidad de la operación N.° ${offer.id} (${certificateNumber}),`,
      margin + 4,
      y + 12.5
    );
    doc.text(
      `acordada entre ${sellerDetails.organizationName} y ${buyerDetails.organizationName} a través de la plataforma Publik Solidario.`,
      margin + 4,
      y + 17.5
    );

    return doc;
  };

  // Generate PDF Blob URL for in-app visualization when modal opens
  useEffect(() => {
    let active = true;
    let currentUrl: string | null = null;

    if (isEligible) {
      setIsGenerating(true);
      buildPdfDocument()
        .then((doc) => {
          if (!active || !doc) return;
          const blob = doc.output('blob');
          currentUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(currentUrl);
          setIsGenerating(false);
        })
        .catch(() => {
          if (active) setIsGenerating(false);
        });
    }

    return () => {
      active = false;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [offer?.id, isEligible]);

  if (!isEligible || !offer) return null;

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const doc = await buildPdfDocument();
      if (doc) {
        doc.save(`Acta-Entrega-Publik-Solidario-${offer.id.toUpperCase()}.pdf`);
        showToast('Acta de entrega descargada en formato PDF', 'success');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintCertificate = async () => {
    const doc = await buildPdfDocument();
    if (!doc) return;
    doc.autoPrint();
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    printIframe.src = url;
    document.body.appendChild(printIframe);

    printIframe.onload = () => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch {
        window.print();
      }
    };
    showToast('Preparando impresión del acta de entrega...', 'info');
  };

  useEffect(() => {
    if (!offer) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [offer, onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        {/* Barra Superior de Controles (Visualizar, Descargar, Imprimir) */}
        <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  {certificateNumber}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-[11px] text-slate-300">Comprobante Oficial</span>
              </div>
              <h2 className="text-base font-bold text-white">
                Acta de Entrega y Recepción de Alimentos
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Alternar modo de visualización */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('document')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  viewMode === 'document'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Vista Documento
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf_embed')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                  viewMode === 'pdf_embed'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visor PDF</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrintCertificate}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generando...' : 'Descargar PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar acta de entrega"
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Acta: Vista Documento o Visor PDF Nativo */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950">
          {viewMode === 'pdf_embed' && pdfBlobUrl ? (
            <div className="w-full h-[70vh] bg-white rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800">
              <iframe
                src={pdfBlobUrl}
                title={`Acta de entrega ${certificateNumber}`}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            /* Hoja de Documento A4 Profesional */
            <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl shadow-md border border-slate-200 p-6 sm:p-8 space-y-6">
              {/* 1. Encabezado Institucional con Logo de Publik Solidario */}
              <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="bg-white rounded-lg p-2 shrink-0">
                    <img
                      src="/logo.png"
                      alt="Publik Solidario"
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                      Plataforma de Rescate y Aprovechamiento Alimentario
                    </span>
                    <h1 className="text-lg font-bold text-white tracking-tight">
                      ACTA DE ENTREGA DE ALIMENTOS
                    </h1>
                  </div>
                </div>

                <div className="sm:text-right space-y-0.5 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                  <span className="text-[11px] text-slate-400 block">Identificador de Operación</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 block">
                    {certificateNumber}
                  </span>
                  <span className="text-[11px] font-mono text-slate-300 block">
                    Ref. Oferta: {offer.id}
                  </span>
                </div>
              </div>

              {/* 2. Franja de Metadatos de la Operación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Fecha de Emisión / Acuerdo
                  </span>
                  <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                    {issueDateFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Tipo de Operación
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {operationType}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                    Estado Verificado
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>OPERACIÓN ACEPTADA</span>
                  </span>
                </div>
              </div>

              {/* 3. Datos de las Partes (Quien publica / entrega y Quien recibe / compra) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parte A: Quien publica el producto */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>1. DATOS DE QUIEN PUBLICA Y ENTREGA</span>
                  </div>
                  <div className="p-4 space-y-1.5 text-xs">
                    <p className="text-sm font-bold text-slate-900">
                      {sellerDetails.organizationName}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Responsable:</strong>{' '}
                      {sellerDetails.contactName}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Tipo de entidad:</strong>{' '}
                      {sellerDetails.roleOrType}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">NIT / Identificación:</strong>{' '}
                      <span className="font-mono">{sellerDetails.nit}</span>
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Contacto:</strong> {sellerDetails.phone} ·{' '}
                      {sellerDetails.email}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Sede de despacho:</strong>{' '}
                      {sellerDetails.city} — {sellerDetails.address}
                    </p>
                  </div>
                </div>

                {/* Parte B: Quien recibe o realiza la compra */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>2. DATOS DE QUIEN RECIBE / ADQUIERE</span>
                  </div>
                  <div className="p-4 space-y-1.5 text-xs">
                    <p className="text-sm font-bold text-slate-900">
                      {buyerDetails.organizationName}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Representante:</strong>{' '}
                      {buyerDetails.contactName}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Tipo de organización:</strong>{' '}
                      {buyerDetails.roleOrType}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">NIT / Identificación:</strong>{' '}
                      <span className="font-mono">{buyerDetails.nit}</span>
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Contacto:</strong> {buyerDetails.phone} ·{' '}
                      {buyerDetails.email}
                    </p>
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Ubicación:</strong> {buyerDetails.city} —{' '}
                      {buyerDetails.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Especificación del Producto y Valor de la Operación */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center gap-2 text-xs font-bold">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>3. DETALLE DEL PRODUCTO Y VALOR DE LA OPERACIÓN</span>
                </div>
                <div className="p-4 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3 border-b border-slate-100">
                    <div className="sm:col-span-1">
                      <span className="text-slate-500 block">Nombre del producto</span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                        {offer.productName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Categoría</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">
                        {productCategory}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Estado del producto</span>
                      <span className="font-semibold text-emerald-700 mt-0.5 block">
                        {productCondition}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                    <div>
                      <span className="text-slate-500 block">Cantidad acordada</span>
                      <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">
                        {offer.requestedQuantity} {offer.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Fecha vencimiento lote</span>
                      <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                        {productExpiration}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Valor unitario</span>
                      <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                        ${offer.offeredPricePerUnit.toLocaleString('es-CO')} COP / {offer.unit}
                      </span>
                    </div>
                    <div className="sm:text-right bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                        Valor Total Operación
                      </span>
                      <span className="text-base font-mono font-bold text-emerald-700">
                        ${offer.totalOfferedPrice.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Información Relevante de Entrega */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>4. INFORMACIÓN RELEVANTE DE ENTREGA Y LOGÍSTICA</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
                  <p>
                    <strong className="text-slate-900">Modalidad de retiro:</strong>{' '}
                    {offer.pickupMethod}
                  </p>
                  <p>
                    <strong className="text-slate-900">Fecha acordada de entrega:</strong>{' '}
                    <span className="font-mono">{offer.proposedDate}</span>
                  </p>
                  <p className="sm:col-span-2">
                    <strong className="text-slate-900">Dirección de entrega:</strong>{' '}
                    {sellerDetails.city} — {sellerDetails.address}
                  </p>
                  <p className="sm:col-span-2">
                    <strong className="text-slate-900">Condiciones logísticas del lote:</strong>{' '}
                    {deliveryConditions}
                  </p>
                </div>
              </div>

              {/* 6. Espacio para Firmas o Confirmación de las Partes */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  5. Firmas y Confirmación de Conformidad de las Partes
                </h3>
                <p className="text-[11px] text-slate-500">
                  Con la suscripción del presente documento, las partes certifican que los alimentos fueron verificados físicamente en cantidad y estado al momento de la entrega.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border border-slate-300 rounded-xl p-4 pt-12 flex flex-col justify-end bg-white">
                    <div className="border-t border-slate-400 pt-2">
                      <p className="text-xs font-bold text-slate-900">
                        ENTREGADO POR (ESTABLECIMIENTO)
                      </p>
                      <p className="text-[11px] text-slate-600">{sellerDetails.organizationName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        NIT: {sellerDetails.nit} · Firma y Sello
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-4 pt-12 flex flex-col justify-end bg-white">
                    <div className="border-t border-slate-400 pt-2">
                      <p className="text-xs font-bold text-slate-900">
                        RECIBIDO POR (ORGANIZACIÓN / COMPRADOR)
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {buyerDetails.organizationName} ({buyerDetails.contactName})
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        NIT: {buyerDetails.nit} · Firma de Conformidad
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Sección Final: Identificación como Comprobante Oficial de Entrega */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-900">
                    COMPROBANTE OFICIAL DE ENTREGA — PUBLIK SOLIDARIO ({certificateNumber})
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Este documento acredita formalmente la entrega y recepción del lote{' '}
                    <strong>{offer.productName}</strong> ({offer.requestedQuantity} {offer.unit}) correspondiente a la operación aceptada N.°{' '}
                    <span className="font-mono font-semibold">{offer.id}</span> en la plataforma{' '}
                    <strong>Publik Solidario</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
