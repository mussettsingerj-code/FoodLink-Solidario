import React from 'react';
import { X, ShieldCheck, FileText, Leaf, HelpCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export type FooterModalType = 'privacy' | 'terms' | 'sustainability' | 'help' | null;

interface FooterInfoModalProps {
  type: FooterModalType;
  onClose: () => void;
}

export const FooterInfoModal: React.FC<FooterInfoModalProps> = ({ type, onClose }) => {
  const { language } = useI18n();

  if (!type) return null;

  const isEn = language === 'en';

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          title: isEn ? 'Privacy Policy & Data Protection' : 'Política de Privacidad y Tratamiento de Datos',
          subtitle: isEn
            ? 'Compliant with Colombian Statutory Law 1581 of 2012 (Habeas Data)'
            : 'En cumplimiento de la Ley Estatutaria 1581 de 2012 de Colombia (Habeas Data)',
          body: isEn ? (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                At <strong>FoodLink Solidario</strong>, we are committed to safeguarding the personal, commercial, and operational information of all participating entities, including supermarkets, food foundations, community kitchens, and agricultural suppliers.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  1. Principles of Data Processing
                </h4>
                <p>
                  Information collected through registration (name, tax ID NIT, verified corporate email, contact phone number, and location) is exclusively utilized for verifying legal standing, facilitating food rescue negotiations, and issuing delivery certificates.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  2. Rights of Data Holders
                </h4>
                <p>
                  As an account holder, you may exercise your rights to know, update, rectify, and request deletion of your information by contacting our compliance desk at{' '}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">mussettsingerj@gmail.com</span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                En <strong>FoodLink Solidario</strong>, nos comprometemos a garantizar la confidencialidad, seguridad y debido tratamiento de los datos personales y comerciales de todos los participantes de la red en Medellín y Colombia.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  1. Finalidad del Tratamiento
                </h4>
                <p>
                  Los datos provistos (nombre de representante, NIT/cédula, correo electrónico institucional, teléfono logístico y sede física) se emplean exclusivamente para validar la legitimidad de las organizaciones, coordinar recogidas de alimentos y emitir actas oficiales de entrega.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  2. Derechos del Titular (Habeas Data)
                </h4>
                <p>
                  El titular puede solicitar en cualquier momento la actualización, rectificación o supresión de sus registros escribiendo a nuestro oficial de datos a{' '}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">mussettsingerj@gmail.com</span>.
                </p>
              </div>
            </div>
          ),
        };

      case 'terms':
        return {
          icon: <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          title: isEn ? 'Terms of Service & Platform Guidelines' : 'Términos de Servicio y Condiciones de Uso',
          subtitle: isEn
            ? 'Regulating food rescue and circular transactions under Colombian Law 1990 of 2019'
            : 'Marco regulatorio para la prevención de pérdidas de alimentos bajo la Ley 1990 de 2019',
          body: isEn ? (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                FoodLink Solidario operates as a technological bridge connecting surplus food suppliers (sellers/donors) with social entities and buyers. By using the platform, users agree to the following conditions:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>
                  <strong>Food Safety & Quality:</strong> All published lots must be suitable for human consumption, properly stored, and within traceability standards.
                </li>
                <li>
                  <strong>Direct Commitment:</strong> Accepted offers constitute a binding operational agreement between buyer and seller regarding pickup date and conditions.
                </li>
                <li>
                  <strong>Role Separation:</strong> Buyer and seller roles determine platform access and dashboard functionalities to maintain security and order.
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                FoodLink Solidario es una plataforma colaborativa para dinamizar el aprovechamiento de alimentos. Al registrarte y operar, aceptas los siguientes lineamientos:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>
                  <strong>Inocuidad Alimentaria:</strong> Todo lote publicado debe encontrarse en condiciones sanitarias óptimas para consumo humano, respaldado por la Ley 1990 de 2019.
                </li>
                <li>
                  <strong>Compromiso Operativo:</strong> Al aceptar una oferta, ambas partes coordinan la recogida en la sede del vendedor cumpliendo con los plazos acordados.
                </li>
                <li>
                  <strong>Roles Claros:</strong> Las funciones de comprador y vendedor son exclusivas y garantizan la transparencia de las transacciones y emisiones de actas.
                </li>
              </ul>
            </div>
          ),
        };

      case 'sustainability':
        return {
          icon: <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          title: isEn ? 'Sustainability & Circular Impact Report' : 'Reporte de Sostenibilidad e Impacto Circular',
          subtitle: isEn
            ? 'Circular economy metrics & SDG 2 / SDG 12 indicators in Medellín'
            : 'Indicadores de economía circular y ODS 2 / ODS 12 en Medellín y Valle de Aburrá',
          body: isEn ? (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 font-display block">
                    +48,200 kg
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Food Rescued to Date
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 font-display block">
                    -94.5 Tons
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    CO₂ Avoided Emissions
                  </span>
                </div>
              </div>
              <p>
                Our operational hub in <strong>Medellín and the Aburrá Valley</strong> prevents organic waste from entering landfills, directly supporting Sustainable Development Goals 2 (Zero Hunger) and 12 (Responsible Consumption).
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 font-display block">
                    +48.200 kg
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Alimentos Rescatados
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 font-display block">
                    -94,5 Ton
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    CO₂ Evitado a la Atmósfera
                  </span>
                </div>
              </div>
              <p>
                Nuestra presencia centralizada en <strong>Medellín y el Valle de Aburrá</strong> canaliza excedentes comerciales hacia fundaciones y compradores solidarios, evitando el desperdicio orgánico y mitigando el impacto ambiental.
              </p>
            </div>
          ),
        };

      case 'help':
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
          title: isEn ? 'Help Center & Direct Channels' : 'Centro de Ayuda y Canales de Soporte',
          subtitle: isEn
            ? 'Assistance for buyers, foundations, and commercial sellers'
            : 'Atención personalizada para compradores, fundaciones y comercios aliados',
          body: (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                {isEn
                  ? 'Have questions about submitting an offer, publishing a surplus batch, or verifying an account? Reach our operational support team directly:'
                  : '¿Tienes dudas sobre cómo enviar una oferta, publicar un lote de alimentos o validar tu cuenta? Contáctanos de forma inmediata:'}
              </p>
              <div className="space-y-2.5">
                <a
                  href="mailto:mussettsingerj@gmail.com"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                >
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                      {isEn ? 'Official Email' : 'Correo Oficial'}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">mussettsingerj@gmail.com</span>
                  </div>
                </a>

                <a
                  href="tel:+573045263106"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                >
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                      {isEn ? 'Support Hotline / WhatsApp' : 'Línea de Atención / WhatsApp'}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">+57 304 526 3106</span>
                  </div>
                </a>
              </div>
            </div>
          ),
        };
    }
  };

  const content = getContent();

  React.useEffect(() => {
    if (!type) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 sm:space-y-5 relative my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600"
          aria-label={isEn ? 'Close modal' : 'Cerrar ventana'}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            {content.icon}
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white leading-snug">
              {content.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {content.subtitle}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 custom-scroll max-h-[60vh]">
          {content.body}
        </div>

        <div className="pt-2 flex justify-end shrink-0 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {isEn ? 'Close' : 'Entendido'}
          </button>
        </div>
      </div>
    </div>
  );
};
