// Languages a visitor can read a creator page and chat in. Pages are written
// in Korean; everything else is translated (see supabase/functions/knil).

import type { Block, Page } from "./types";

// `name` in the language itself, `ko` for the creator.
export type Lang = { code: string; name: string; ko: string; flag: string };

export const LANGS: Lang[] = [
  { code: "ko", name: "한국어", ko: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", ko: "영어", flag: "🇺🇸" },
  { code: "ja", name: "日本語", ko: "일본어", flag: "🇯🇵" },
  { code: "zh-CN", name: "简体中文", ko: "중국어(간체)", flag: "🇨🇳" },
  { code: "zh-TW", name: "繁體中文", ko: "중국어(번체)", flag: "🇹🇼" },
  { code: "th", name: "ไทย", ko: "태국어", flag: "🇹🇭" },
  { code: "vi", name: "Tiếng Việt", ko: "베트남어", flag: "🇻🇳" },
  { code: "id", name: "Bahasa Indonesia", ko: "인도네시아어", flag: "🇮🇩" },
  { code: "es", name: "Español", ko: "스페인어", flag: "🇪🇸" },
  { code: "fr", name: "Français", ko: "프랑스어", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", ko: "독일어", flag: "🇩🇪" },
  { code: "pt", name: "Português", ko: "포르투갈어", flag: "🇧🇷" },
  { code: "ru", name: "Русский", ko: "러시아어", flag: "🇷🇺" },
];

export const langOf = (code: string) => LANGS.find((l) => l.code === code) ?? LANGS[0];

// Best match for the visitor's phone language; Korean when nothing fits.
export function detectLang(): string {
  const prefs = typeof navigator === "undefined" ? [] : navigator.languages ?? [navigator.language];
  for (const raw of prefs) {
    const p = raw.toLowerCase();
    if (p.startsWith("zh")) return /tw|hk|hant/.test(p) ? "zh-TW" : "zh-CN";
    const hit = LANGS.find((l) => l.code === p.split("-")[0]);
    if (hit) return hit.code;
  }
  return "ko";
}

type UI = {
  propose: string;
  message: string;
  translated: string;
  original: string;
  chatTitle: (name: string) => string;
  hello: (name: string) => string;
  placeholder: string;
  send: string;
  ai: string;
  yourName: string;
  waiting: (name: string) => string;
  empty: string;
  language: string;
};

const en: UI = {
  propose: "Business inquiry",
  message: "Message",
  translated: "Translated from Korean",
  original: "Show original",
  chatTitle: (n) => `Chat with ${n}`,
  hello: (n) => `Write in your own language. ${n} reads it in Korean and replies in yours.`,
  placeholder: "Type a message",
  send: "Send",
  ai: "AI reply",
  yourName: "Your name (optional)",
  waiting: (n) => `${n} will see this and reply here.`,
  empty: "No links yet",
  language: "Language",
};

const UI_TEXT: Record<string, UI> = {
  ko: {
    propose: "협업 제안하기",
    message: "메시지",
    translated: "번역된 페이지",
    original: "원문 보기",
    chatTitle: (n) => `${n}에게 메시지`,
    hello: (n) => `편하게 메시지를 남겨 주세요. ${n}님이 확인하고 답장해요.`,
    placeholder: "메시지를 입력하세요",
    send: "보내기",
    ai: "AI 답변",
    yourName: "이름 (선택)",
    waiting: (n) => `${n}님이 확인하면 여기로 답장이 와요.`,
    empty: "아직 추가된 링크가 없어요",
    language: "언어",
  },
  en,
  ja: {
    propose: "お仕事のご相談",
    message: "メッセージ",
    translated: "韓国語から翻訳",
    original: "原文を見る",
    chatTitle: (n) => `${n}とチャット`,
    hello: (n) => `日本語でどうぞ。${n}は韓国語で読み、日本語で返信します。`,
    placeholder: "メッセージを入力",
    send: "送信",
    ai: "AI返信",
    yourName: "お名前（任意）",
    waiting: (n) => `${n}が確認したら、ここに返信が届きます。`,
    empty: "まだリンクがありません",
    language: "言語",
  },
  "zh-CN": {
    propose: "商务合作",
    message: "私信",
    translated: "由韩语翻译",
    original: "查看原文",
    chatTitle: (n) => `和 ${n} 聊天`,
    hello: (n) => `用中文留言就好。${n} 会以韩语阅读，并用中文回复你。`,
    placeholder: "输入消息",
    send: "发送",
    ai: "AI 回复",
    yourName: "你的名字（选填）",
    waiting: (n) => `${n} 看到后会在这里回复。`,
    empty: "还没有链接",
    language: "语言",
  },
  "zh-TW": {
    propose: "商務合作",
    message: "私訊",
    translated: "由韓文翻譯",
    original: "查看原文",
    chatTitle: (n) => `和 ${n} 聊天`,
    hello: (n) => `用中文留言就好。${n} 會以韓文閱讀，並用中文回覆你。`,
    placeholder: "輸入訊息",
    send: "傳送",
    ai: "AI 回覆",
    yourName: "你的名字（選填）",
    waiting: (n) => `${n} 看到後會在這裡回覆。`,
    empty: "還沒有連結",
    language: "語言",
  },
  th: {
    propose: "ติดต่องาน",
    message: "ข้อความ",
    translated: "แปลจากภาษาเกาหลี",
    original: "ดูต้นฉบับ",
    chatTitle: (n) => `แชทกับ ${n}`,
    hello: (n) => `พิมพ์เป็นภาษาไทยได้เลย ${n} จะอ่านเป็นภาษาเกาหลีและตอบกลับเป็นภาษาไทย`,
    placeholder: "พิมพ์ข้อความ",
    send: "ส่ง",
    ai: "AI ตอบกลับ",
    yourName: "ชื่อของคุณ (ไม่บังคับ)",
    waiting: (n) => `${n} จะตอบกลับที่นี่`,
    empty: "ยังไม่มีลิงก์",
    language: "ภาษา",
  },
  vi: {
    propose: "Hợp tác",
    message: "Nhắn tin",
    translated: "Dịch từ tiếng Hàn",
    original: "Xem bản gốc",
    chatTitle: (n) => `Trò chuyện với ${n}`,
    hello: (n) => `Hãy viết bằng tiếng Việt. ${n} đọc bằng tiếng Hàn và trả lời bằng tiếng Việt.`,
    placeholder: "Nhập tin nhắn",
    send: "Gửi",
    ai: "AI trả lời",
    yourName: "Tên của bạn (không bắt buộc)",
    waiting: (n) => `${n} sẽ trả lời tại đây.`,
    empty: "Chưa có liên kết",
    language: "Ngôn ngữ",
  },
  id: {
    propose: "Kerja sama",
    message: "Pesan",
    translated: "Diterjemahkan dari bahasa Korea",
    original: "Lihat asli",
    chatTitle: (n) => `Chat dengan ${n}`,
    hello: (n) => `Tulis dalam bahasamu. ${n} membacanya dalam bahasa Korea dan membalas dalam bahasamu.`,
    placeholder: "Tulis pesan",
    send: "Kirim",
    ai: "Balasan AI",
    yourName: "Namamu (opsional)",
    waiting: (n) => `${n} akan membalas di sini.`,
    empty: "Belum ada tautan",
    language: "Bahasa",
  },
  es: {
    propose: "Colaboraciones",
    message: "Mensaje",
    translated: "Traducido del coreano",
    original: "Ver original",
    chatTitle: (n) => `Chatea con ${n}`,
    hello: (n) => `Escribe en tu idioma. ${n} lo lee en coreano y te responde en el tuyo.`,
    placeholder: "Escribe un mensaje",
    send: "Enviar",
    ai: "Respuesta de IA",
    yourName: "Tu nombre (opcional)",
    waiting: (n) => `${n} te responderá aquí.`,
    empty: "Aún no hay enlaces",
    language: "Idioma",
  },
  fr: {
    propose: "Partenariats",
    message: "Message",
    translated: "Traduit du coréen",
    original: "Voir l'original",
    chatTitle: (n) => `Discuter avec ${n}`,
    hello: (n) => `Écrivez dans votre langue. ${n} le lit en coréen et vous répond dans la vôtre.`,
    placeholder: "Écrire un message",
    send: "Envoyer",
    ai: "Réponse IA",
    yourName: "Votre nom (facultatif)",
    waiting: (n) => `${n} vous répondra ici.`,
    empty: "Pas encore de liens",
    language: "Langue",
  },
  de: {
    propose: "Kooperationen",
    message: "Nachricht",
    translated: "Aus dem Koreanischen übersetzt",
    original: "Original anzeigen",
    chatTitle: (n) => `Chat mit ${n}`,
    hello: (n) => `Schreib in deiner Sprache. ${n} liest es auf Koreanisch und antwortet in deiner.`,
    placeholder: "Nachricht schreiben",
    send: "Senden",
    ai: "KI-Antwort",
    yourName: "Dein Name (optional)",
    waiting: (n) => `${n} antwortet dir hier.`,
    empty: "Noch keine Links",
    language: "Sprache",
  },
  pt: {
    propose: "Parcerias",
    message: "Mensagem",
    translated: "Traduzido do coreano",
    original: "Ver original",
    chatTitle: (n) => `Converse com ${n}`,
    hello: (n) => `Escreva no seu idioma. ${n} lê em coreano e responde no seu.`,
    placeholder: "Digite uma mensagem",
    send: "Enviar",
    ai: "Resposta da IA",
    yourName: "Seu nome (opcional)",
    waiting: (n) => `${n} vai responder aqui.`,
    empty: "Ainda não há links",
    language: "Idioma",
  },
  ru: {
    propose: "Сотрудничество",
    message: "Написать",
    translated: "Переведено с корейского",
    original: "Показать оригинал",
    chatTitle: (n) => `Чат с ${n}`,
    hello: (n) => `Пишите на своём языке. ${n} прочитает по-корейски и ответит на вашем.`,
    placeholder: "Введите сообщение",
    send: "Отправить",
    ai: "Ответ ИИ",
    yourName: "Ваше имя (необязательно)",
    waiting: (n) => `${n} ответит здесь.`,
    empty: "Ссылок пока нет",
    language: "Язык",
  },
};

export const ui = (code: string): UI => UI_TEXT[code] ?? en;

const MAKE: Record<string, string> = {
  ko: "나만의 프로필 만들기",
  en: "Make your own page",
  ja: "自分のページを作る",
  "zh-CN": "创建我的主页",
  "zh-TW": "建立我的主頁",
};
export const makeYours = (code: string) => MAKE[code] ?? MAKE.en;

// The words on a page that a visitor reads, in a stable order. The same
// list is built on the server before translating (supabase/functions/knil).
export function pageStrings(page: Page): string[] {
  const out: string[] = [page.profile.bio];
  for (const b of page.blocks) {
    if (b.hidden) continue;
    switch (b.type) {
      case "link":
        out.push(b.title, b.sub, b.label);
        break;
      case "video":
        out.push(b.heading, b.title, b.meta);
        break;
      case "gallery":
        out.push(b.title, b.note, ...b.items.map((i) => i.label));
        break;
      case "products":
        out.push(b.title, b.note, ...b.items.map((i) => i.name));
        break;
      case "calendar":
        out.push(b.title, b.note, ...b.items.map((i) => i.title), ...b.items.map((i) => i.kind));
        break;
      case "booking":
        out.push(b.title, b.note, ...b.items.flatMap((i) => [i.name, i.price, i.duration]));
        break;
      case "place":
        out.push(b.title, b.address, b.hours);
        break;
    }
  }
  return [...new Set(out.map((s) => s.trim()).filter((s) => s && /\p{L}/u.test(s)))];
}

// Swaps every translatable string on the page for its translation.
export function translatePage(page: Page, dict: Record<string, string>): Page {
  const t = (s: string) => dict[s.trim()] ?? s;
  const blocks = page.blocks.map((b): Block => {
    switch (b.type) {
      case "link":
        return { ...b, title: t(b.title), sub: t(b.sub), label: t(b.label) };
      case "video":
        return { ...b, heading: t(b.heading), title: t(b.title), meta: t(b.meta) };
      case "gallery":
        return { ...b, title: t(b.title), note: t(b.note), items: b.items.map((i) => ({ ...i, label: t(i.label) })) };
      case "products":
        return { ...b, title: t(b.title), note: t(b.note), items: b.items.map((i) => ({ ...i, name: t(i.name) })) };
      case "calendar":
        return { ...b, title: t(b.title), note: t(b.note), items: b.items.map((i) => ({ ...i, title: t(i.title) })) };
      case "booking":
        return { ...b, title: t(b.title), note: t(b.note), items: b.items.map((i) => ({ ...i, name: t(i.name), price: t(i.price), duration: t(i.duration) })) };
      case "place":
        return { ...b, title: t(b.title), address: t(b.address), hours: t(b.hours) };
      default:
        return b;
    }
  });
  return { ...page, profile: { ...page.profile, bio: t(page.profile.bio) }, blocks };
}

// Words on a clinic's or brand's page and its booking form.
export type BookUI = {
  book: string;
  chat: string;
  pick: string;
  date: string;
  time: string;
  times: [string, string, string];
  name: string;
  contact: string;
  note: string;
  submit: string;
  done: string;
  doneSub: string;
  openChat: string;
  hours: string;
  call: string;
  map: string;
};

const BOOK: Record<string, BookUI> = {
  ko: { book: "상담 예약", chat: "채팅 상담", pick: "시술 · 서비스", date: "희망 날짜", time: "희망 시간", times: ["오전", "오후", "저녁"], name: "이름", contact: "연락처 (이메일, WhatsApp, LINE)", note: "궁금한 점 (선택)", submit: "예약 요청 보내기", done: "예약 요청을 보냈어요", doneSub: "확인 후 채팅과 남겨주신 연락처로 확정 안내를 드려요.", openChat: "채팅 열기", hours: "운영 시간", call: "전화", map: "지도" },
  en: { book: "Book a consultation", chat: "Chat with us", pick: "Treatment", date: "Preferred date", time: "Preferred time", times: ["Morning", "Afternoon", "Evening"], name: "Name", contact: "Email, WhatsApp or LINE", note: "Questions (optional)", submit: "Send request", done: "Request sent", doneSub: "We'll confirm in this chat and through the contact you left.", openChat: "Open chat", hours: "Hours", call: "Call", map: "Map" },
  ja: { book: "カウンセリング予約", chat: "チャット相談", pick: "施術・メニュー", date: "希望日", time: "希望時間帯", times: ["午前", "午後", "夕方"], name: "お名前", contact: "メール、WhatsApp、LINE", note: "ご質問（任意）", submit: "予約リクエストを送る", done: "予約リクエストを送りました", doneSub: "確認後、チャットとご連絡先に確定のご案内をお送りします。", openChat: "チャットを開く", hours: "営業時間", call: "電話", map: "地図" },
  "zh-CN": { book: "预约咨询", chat: "在线咨询", pick: "项目", date: "希望日期", time: "希望时间", times: ["上午", "下午", "晚上"], name: "姓名", contact: "邮箱、WhatsApp 或微信", note: "想咨询的问题（选填）", submit: "发送预约申请", done: "预约申请已发送", doneSub: "确认后会通过聊天和你留下的联系方式通知你。", openChat: "打开聊天", hours: "营业时间", call: "电话", map: "地图" },
  "zh-TW": { book: "預約諮詢", chat: "線上諮詢", pick: "項目", date: "希望日期", time: "希望時段", times: ["上午", "下午", "晚上"], name: "姓名", contact: "Email、WhatsApp 或 LINE", note: "想詢問的問題（選填）", submit: "送出預約申請", done: "預約申請已送出", doneSub: "確認後會透過聊天和你留下的聯絡方式通知你。", openChat: "開啟聊天", hours: "營業時間", call: "電話", map: "地圖" },
  th: { book: "จองปรึกษา", chat: "แชทสอบถาม", pick: "ทรีตเมนต์", date: "วันที่ต้องการ", time: "ช่วงเวลาที่ต้องการ", times: ["เช้า", "บ่าย", "เย็น"], name: "ชื่อ", contact: "อีเมล, WhatsApp หรือ LINE", note: "คำถาม (ไม่บังคับ)", submit: "ส่งคำขอจอง", done: "ส่งคำขอจองแล้ว", doneSub: "เราจะยืนยันทางแชทนี้และช่องทางติดต่อที่คุณให้ไว้", openChat: "เปิดแชท", hours: "เวลาทำการ", call: "โทร", map: "แผนที่" },
  vi: { book: "Đặt lịch tư vấn", chat: "Nhắn tin tư vấn", pick: "Dịch vụ", date: "Ngày mong muốn", time: "Khung giờ mong muốn", times: ["Sáng", "Chiều", "Tối"], name: "Tên", contact: "Email, WhatsApp hoặc Zalo", note: "Câu hỏi (không bắt buộc)", submit: "Gửi yêu cầu", done: "Đã gửi yêu cầu", doneSub: "Chúng tôi sẽ xác nhận qua khung chat này và liên hệ bạn để lại.", openChat: "Mở chat", hours: "Giờ làm việc", call: "Gọi", map: "Bản đồ" },
  id: { book: "Buat janji konsultasi", chat: "Chat dengan kami", pick: "Perawatan", date: "Tanggal pilihan", time: "Waktu pilihan", times: ["Pagi", "Siang", "Malam"], name: "Nama", contact: "Email, WhatsApp atau LINE", note: "Pertanyaan (opsional)", submit: "Kirim permintaan", done: "Permintaan terkirim", doneSub: "Kami akan mengonfirmasi lewat chat ini dan kontak yang kamu tinggalkan.", openChat: "Buka chat", hours: "Jam buka", call: "Telepon", map: "Peta" },
  es: { book: "Reservar consulta", chat: "Escríbenos", pick: "Tratamiento", date: "Fecha preferida", time: "Horario preferido", times: ["Mañana", "Tarde", "Noche"], name: "Nombre", contact: "Email, WhatsApp o LINE", note: "Preguntas (opcional)", submit: "Enviar solicitud", done: "Solicitud enviada", doneSub: "Te confirmaremos por este chat y por el contacto que dejaste.", openChat: "Abrir chat", hours: "Horario", call: "Llamar", map: "Mapa" },
  fr: { book: "Réserver une consultation", chat: "Nous écrire", pick: "Soin", date: "Date souhaitée", time: "Créneau souhaité", times: ["Matin", "Après-midi", "Soir"], name: "Nom", contact: "E-mail, WhatsApp ou LINE", note: "Questions (facultatif)", submit: "Envoyer la demande", done: "Demande envoyée", doneSub: "Nous confirmerons dans ce chat et via le contact laissé.", openChat: "Ouvrir le chat", hours: "Horaires", call: "Appeler", map: "Plan" },
  de: { book: "Beratung buchen", chat: "Chat starten", pick: "Behandlung", date: "Wunschdatum", time: "Wunschzeit", times: ["Vormittag", "Nachmittag", "Abend"], name: "Name", contact: "E-Mail, WhatsApp oder LINE", note: "Fragen (optional)", submit: "Anfrage senden", done: "Anfrage gesendet", doneSub: "Wir bestätigen in diesem Chat und über deinen Kontakt.", openChat: "Chat öffnen", hours: "Öffnungszeiten", call: "Anrufen", map: "Karte" },
  pt: { book: "Agendar consulta", chat: "Fale conosco", pick: "Tratamento", date: "Data preferida", time: "Horário preferido", times: ["Manhã", "Tarde", "Noite"], name: "Nome", contact: "E-mail, WhatsApp ou LINE", note: "Dúvidas (opcional)", submit: "Enviar pedido", done: "Pedido enviado", doneSub: "Vamos confirmar por este chat e pelo contato informado.", openChat: "Abrir chat", hours: "Horário", call: "Ligar", map: "Mapa" },
  ru: { book: "Записаться на консультацию", chat: "Написать нам", pick: "Процедура", date: "Желаемая дата", time: "Желаемое время", times: ["Утро", "День", "Вечер"], name: "Имя", contact: "Email, WhatsApp или LINE", note: "Вопросы (необязательно)", submit: "Отправить заявку", done: "Заявка отправлена", doneSub: "Мы подтвердим запись в этом чате и по указанному контакту.", openChat: "Открыть чат", hours: "Часы работы", call: "Позвонить", map: "Карта" },
};
export const bookUi = (code: string): BookUI => BOOK[code] ?? BOOK.en;
