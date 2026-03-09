// public/js/i18n.js — UI Internationalization (ar / tr / en)

const TRANSLATIONS = {
  ar: {
    logo:                 'TRANLY · تحدّث',
    tagline:              'تحدث إلى العالم',
    header_badge:         '🌍 24 لغة · مدعوم بالذكاء الاصطناعي',
    feat_langs:           'يدعم أكثر من 24 لغة تلقائيًا',
    feat_ai:              'ترجمة فورية بالذكاء الاصطناعي',
    feat_share:           'مشاركة بالرابط أو رمز QR',
    btn_new_chat:         '<span>➕</span> محادثة جديدة',
    recent_chats_title:   'محادثاتك الأخيرة',
    new_chat_label:       'محادثة جديدة',
    history_btn:          'سجل المحادثات السابقة',
    mode_title:           'اختر نوع المحادثة',
    mode_quick_name:      'ابدأ محادثة عابرة',
    mode_quick_desc:      'لمحادثاتك الفجائية والخاطفة ابدأ هنا، تُحذف بعد ساعتين',
    mode_two_name:        'ابدأ حديثًا بأي لغة',
    mode_two_desc:        'تبقى سجلات هذه المحادثة لـ 30 يومًا، ويمكن مواصلة الحديث دائمًا خلالها.',
    mode_badge:           '⚡ عابرة',
    invite_title:         'ادعُ صديقًا للتحدث',
    invite_logo:          'ادعُ المشارك',
    invite_h2:            'شارك رابط الغرفة',
    invite_desc:          'امسح QR أو أرسل الرابط',
    link_hint:            'اضغط على الرابط لنسخه',
    copy_ok:              'تم النسخ ✓',
    btn_start:            '<span>💬</span> بدء المحادثة',
    btn_back:             '← رجوع',
    lang_h_host:          'اختر لغتك',
    lang_h_guest:         'مرحباً! اختر لغتك',
    lang_d_host:          'حدد اللغة التي ستكتب بها',
    lang_d_guest:         'ستصلك رسائل الطرف الآخر مترجمة بلغتك',
    badge_device:         'جهازك',
    badge_suggested:      'مقترح',
    btn_confirm:          'تأكيد واستمرار',
    btn_creating:         'جارٍ الإنشاء...',
    btn_confirming:       'جارٍ التأكيد...',
    chat_connecting:      'جارٍ الاتصال...',
    chat_wait:            'في انتظار المشارك...',
    overlay_title:        'في انتظار المشارك...',
    overlay_desc:         'أرسل له الرابط أو اعرض عليه رمز QR',
    placeholder:          'اكتب رسالتك...',
    my_lang_default:      'لغتك',
    translating_badge:    'يترجم...',
    trans_pending:        'جارٍ الترجمة...',
    copy_trans:           'نسخ ✦',
    copy_trans_done:      'تم نسخ الترجمة ✓',
    err_trans:            '⚠ فشلت الترجمة: ',
    err_send:             '⚠ فشل الإرسال: ',
    err_mic_unsupported:  '⚠ المتصفح لا يدعم الإدخال الصوتي — جرّب Chrome أو Edge',
    err_mic_notallowed:   '⚠ لم يُمنح إذن الميكروفون',
    err_mic_network:      '⚠ خطأ في الشبكة',
    err_mic_nospeech:     '⚠ لم يُكتشف أي كلام',
    err_mic_start:        '⚠ تعذّر بدء التسجيل: ',
    err_room_expired:     '⚠ الغرفة غير موجودة أو انتهت صلاحيتها',
    joined_you:           'انضممت إلى المحادثة',
    joined_them:          (name) => `${name} انضم إلى المحادثة`,
    creating:             'جارٍ الإنشاء...',
    btn_leave:            '← مغادرة',
    err_connection:       '⚠ انقطع الاتصال — تحقق من الشبكة',
    err_trans_nosend:     '⚠ فشلت الترجمة — لم تُرسل الرسالة',
    err_too_long:         '⚠ الرسالة طويلة جداً (الحد الأقصى 500 حرف)',
    partner_left:         'قد يكون الشريك قد غادر المحادثة',
    rec_tap_stop:         'اضغط للإيقاف',
    rec_cancel:           'إلغاء التسجيل',
    msg_deleted:          'تم حذف هذه الرسالة',
    msg_delete_btn:       'حذف الرسالة',
    qr_unavailable:       'اضغط الرابط أعلاه لنسخه',
    transcribing:         '🎙 جارٍ تحويل الصوت...',
    err_transcribe:       '⚠ فشل التحويل الصوتي — ',
  },

  tr: {
    logo:                 'TRANLY · Konuş',
    tagline:              'Dünyayı konuş',
    header_badge:         '🌍 24 dil · Yapay zeka destekli',
    feat_langs:           '24\'ten fazla dili otomatik destekler',
    feat_ai:              'Yapay zeka ile anlık çeviri',
    feat_share:           'Bağlantı veya QR kodu ile paylaşım',
    btn_new_chat:         '<span>➕</span> Yeni Sohbet',
    recent_chats_title:   'Son Sohbetler',
    new_chat_label:       'Yeni Sohbet',
    history_btn:          'Önceki Sohbetler',
    mode_title:           'Sohbet türünü seçin',
    mode_quick_name:      'Hızlı sohbet başlat',
    mode_quick_desc:      'Anlık ve kısa sohbetler için buradan başla, 2 saatte silinir',
    mode_two_name:        'Herhangi bir dilde başlat',
    mode_two_desc:        'Sohbet geçmişi 30 gün saklanır ve her zaman devam edebilirsiniz.',
    mode_badge:           '⚡ Geçici',
    invite_title:         'Konuşmak için bir arkadaş davet et',
    invite_logo:          'Katılımcıyı Davet Et',
    invite_h2:            'Oda bağlantısını paylaşın',
    invite_desc:          'QR\'ı tarayın veya bağlantıyı gönderin',
    link_hint:            'Kopyalamak için bağlantıya tıklayın',
    copy_ok:              'Kopyalandı ✓',
    btn_start:            '<span>💬</span> Sohbeti Başlat',
    btn_back:             '← Geri',
    lang_h_host:          'Dilinizi seçin',
    lang_h_guest:         'Hoş geldiniz! Dilinizi seçin',
    lang_d_host:          'Yazacağınız dili seçin',
    lang_d_guest:         'Diğer tarafın mesajları kendi dilinizde çevrilecek',
    badge_device:         'Cihazınız',
    badge_suggested:      'Önerilen',
    btn_confirm:          'Onayla ve Devam Et',
    btn_creating:         'Oluşturuluyor...',
    btn_confirming:       'Onaylanıyor...',
    chat_connecting:      'Bağlanıyor...',
    chat_wait:            'Katılımcı bekleniyor...',
    overlay_title:        'Katılımcı bekleniyor...',
    overlay_desc:         'Bağlantıyı gönderin veya QR kodunu gösterin',
    placeholder:          'Mesajınızı yazın...',
    my_lang_default:      'Diliniz',
    translating_badge:    'Çevriliyor...',
    trans_pending:        'Çevriliyor...',
    copy_trans:           'Kopyala ✦',
    copy_trans_done:      'Çeviri kopyalandı ✓',
    err_trans:            '⚠ Çeviri başarısız: ',
    err_send:             '⚠ Gönderilemedi: ',
    err_mic_unsupported:  '⚠ Tarayıcı ses girişini desteklemiyor — Chrome veya Edge deneyin',
    err_mic_notallowed:   '⚠ Mikrofon izni verilmedi',
    err_mic_network:      '⚠ Ağ hatası',
    err_mic_nospeech:     '⚠ Konuşma algılanamadı',
    err_mic_start:        '⚠ Kayıt başlatılamadı: ',
    err_room_expired:     '⚠ Oda bulunamadı veya süresi doldu',
    joined_you:           'Sohbete katıldınız',
    joined_them:          (name) => `${name} sohbete katıldı`,
    creating:             'Oluşturuluyor...',
    btn_leave:            '← Çık',
    err_connection:       '⚠ Bağlantı kesildi — ağı kontrol edin',
    err_trans_nosend:     '⚠ Çeviri başarısız — mesaj gönderilmedi',
    err_too_long:         '⚠ Mesaj çok uzun (maksimum 500 karakter)',
    partner_left:         'Katılımcı sohbetten ayrılmış olabilir',
    rec_tap_stop:         'Durdurmak için dokun',
    rec_cancel:           'Kaydı iptal et',
    msg_deleted:          'Bu mesaj silindi',
    msg_delete_btn:       'Mesajı sil',
    qr_unavailable:       'Kopyalamak için yukarıdaki bağlantıya tıklayın',
    transcribing:         '🎙 Ses dönüştürülüyor...',
    err_transcribe:       '⚠ Ses dönüştürme başarısız — ',
  },

  en: {
    logo:                 'TRANLY · Speak',
    tagline:              'Speak the world',
    header_badge:         '🌍 24 languages · AI powered',
    feat_langs:           'Supports 24+ languages automatically',
    feat_ai:              'Instant AI-powered translation',
    feat_share:           'Share via link or QR code',
    btn_new_chat:         '<span>➕</span> New Chat',
    recent_chats_title:   'Recent Chats',
    new_chat_label:       'New Conversation',
    history_btn:          'Previous Conversations',
    mode_title:           'Choose conversation type',
    mode_quick_name:      'Start a quick chat',
    mode_quick_desc:      'For spontaneous, short conversations · deleted after 2h',
    mode_two_name:        'Start a conversation',
    mode_two_desc:        'Chat history saved for 30 days · always resumable',
    mode_badge:           '⚡ Quick',
    invite_title:         'Invite a friend to talk',
    invite_logo:          'Invite Participant',
    invite_h2:            'Share the room link',
    invite_desc:          'Scan QR or send the link',
    link_hint:            'Click the link to copy',
    copy_ok:              'Copied ✓',
    btn_start:            '<span>💬</span> Start Chat',
    btn_back:             '← Back',
    lang_h_host:          'Choose your language',
    lang_h_guest:         'Welcome! Choose your language',
    lang_d_host:          'Select the language you\'ll type in',
    lang_d_guest:         'You\'ll receive messages translated into your language',
    badge_device:         'Your device',
    badge_suggested:      'Suggested',
    btn_confirm:          'Confirm & Continue',
    btn_creating:         'Creating...',
    btn_confirming:       'Confirming...',
    chat_connecting:      'Connecting...',
    chat_wait:            'Waiting for participant...',
    overlay_title:        'Waiting for participant...',
    overlay_desc:         'Send the link or show the QR code',
    placeholder:          'Type your message...',
    my_lang_default:      'Your language',
    translating_badge:    'Translating...',
    trans_pending:        'Translating...',
    copy_trans:           'Copy ✦',
    copy_trans_done:      'Translation copied ✓',
    err_trans:            '⚠ Translation failed: ',
    err_send:             '⚠ Send failed: ',
    err_mic_unsupported:  '⚠ Browser doesn\'t support voice input — try Chrome or Edge',
    err_mic_notallowed:   '⚠ Microphone permission denied',
    err_mic_network:      '⚠ Network error',
    err_mic_nospeech:     '⚠ No speech detected',
    err_mic_start:        '⚠ Couldn\'t start recording: ',
    err_room_expired:     '⚠ Room not found or expired',
    joined_you:           'You joined the chat',
    joined_them:          (name) => `${name} joined the chat`,
    creating:             'Creating...',
    btn_leave:            '← Leave',
    err_connection:       '⚠ Connection lost — check your network',
    err_trans_nosend:     '⚠ Translation failed — message not sent',
    err_too_long:         '⚠ Message too long (max 500 characters)',
    partner_left:         'Partner may have left the chat',
    rec_tap_stop:         'Tap to stop',
    rec_cancel:           'Cancel recording',
    msg_deleted:          'Message deleted',
    msg_delete_btn:       'Delete message',
    qr_unavailable:       'Click the link above to copy it',
    transcribing:         '🎙 Transcribing audio...',
    err_transcribe:       '⚠ Transcription failed — ',
  },
};

/* ── Active language ───────────────────────────────── */
let uiLang = 'en';

/* ── Detect browser language ───────────────────────── */
function detectUILang() {
  const raw = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
  if (raw.startsWith('ar')) return 'ar';
  if (raw.startsWith('tr')) return 'tr';
  return 'en';
}

/* ── Translation lookup ────────────────────────────── */
function t(key, ...args) {
  const val = TRANSLATIONS[uiLang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

/* ── Apply all UI strings to DOM ───────────────────── */
function applyUI() {
  const set = (id, html, attr) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (attr)      el.setAttribute(attr, html);
    else if (html.includes('<')) el.innerHTML = html;
    else           el.textContent = html;
  };

  set('uiLogo',        t('logo'));
  set('uiTagline',     t('tagline'));
  set('headerBadge',   t('header_badge'));
  set('feat1Text',     t('feat_langs'));
  set('feat2Text',     t('feat_ai'));
  set('feat3Text',     t('feat_share'));
  set('recentChatsTitleEl', t('recent_chats_title'));
  set('newChatLabel',       t('new_chat_label'));
  set('modeQuickName', t('mode_quick_name'));
  set('modeQuickDesc', t('mode_quick_desc'));
  set('modeTwoName',   t('mode_two_name'));
  set('modeTwoDesc',   t('mode_two_desc'));
  set('transientBadge', t('mode_badge'));
  set('msgDeleteLabel', t('msg_delete_btn'));
  set('recCancelBtn',   t('rec_cancel'), 'aria-label');
  set('inviteLogo',    t('invite_logo'));
  set('inviteH2',      t('invite_h2'));
  set('inviteDesc',    t('invite_desc'));
  set('inviteHint',    t('link_hint'));
  set('copyToast',     t('copy_ok'));
  set('inviteStartBtn',t('btn_start'));
  set('inviteBackBtn', t('btn_back'));
  set('langConfirmBtn',t('btn_confirm'));
  set('overlayTitle',  t('overlay_title'));
  set('overlayDesc',   t('overlay_desc'));
  set('chatSub',       t('chat_connecting'));
  set('myLangName',    t('my_lang_default'));
  set('translatingBadge', t('translating_badge'));
  set('msgInput',      t('placeholder'), 'placeholder');
}

/* ── Init (called once, before DOMContentLoaded) ──── */
function initI18n() {
  uiLang = detectUILang();
  const isRTL = uiLang === 'ar';
  document.documentElement.lang = uiLang;
  document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
  applyUI();
}
