// ─────────────────────────────────────────────────────────────────────────────
// BỘ NÃO OFFLINE — chạy hoàn toàn trong trình duyệt, KHÔNG cần Ollama/server.
// Dùng làm dự phòng khi không kết nối được Ollama (vd: bản deploy trên Vercel,
// nơi không có localhost:11434). Lời thoại bám theo hồ sơ thật của từng người
// trong nhóm Bom Tấn nên vẫn đúng cá tính, năng lực, hoàn cảnh.
// ─────────────────────────────────────────────────────────────────────────────

import { AgendaTopic } from './meetingAgenda'

// Nhớ chỉ số vừa dùng để tránh lặp câu ngay lập tức.
const lastIdx: Record<string, number> = {}
function pick(key: string, arr: string[]): string {
  if (arr.length === 0) return ''
  let i = Math.floor(Math.random() * arr.length)
  if (arr.length > 1 && i === lastIdx[key]) i = (i + 1) % arr.length
  lastIdx[key] = i
  return arr[i]
}

// ── Trưởng nhóm Duy mở mỗi chủ đề ─────────────────────────────────────────────
const DUY_OPENERS: Record<string, string[]> = {
  pipeline: [
    'Anh em báo số thật coi: tuần này mỗi người mấy khách, căn nào sắp chốt? Quý mình mới đạt 23.8%, phải tăng tốc.',
    'Mình vô thẳng pipeline. Ai đang có khách nóng nói trước, vướng đâu Duy gỡ đó.',
  ],
  'closing-skill': [
    'Vụ Khoa bể hồ sơ vì báo trễ, mình rút kinh nghiệm chung: khách lung lay là báo Duy ngay, đừng ôm.',
    'Hôm nay bàn cách chốt và kèm người mới. Luân, Khoa — chỗ nào kẹt khi chốt nói thẳng ra.',
  ],
  listings: [
    'Nguồn hàng phải minh bạch trên Landsoft, báo nội bộ trước. Không tuồn ra ngoài, không chia 50-50 với cò vườn.',
    'Mình siết nguồn nhà. Ai đang ôm nguồn chưa báo thì cập nhật hết lên hệ thống tuần này.',
  ],
  content: [
    'Clip Thanh Duy một triệu view là cơ hội. Làm sao biến view thành khách xem nhà thật? Bàn cách nhân rộng.',
    'Content là mũi nhọn quý này. Thanh Duy, Khoa — tụi em chia sẻ cách làm cho cả nhóm cùng quay.',
  ],
  discipline: [
    'Mình nói thẳng chuyện giờ giấc và phối hợp. Tháng 5 trễ nhiều quá. Nhóm cần đoàn kết hướng tới chỉ tiêu.',
    'Kỷ luật xử bằng quy chế và bằng chứng, không cảm tính. Ai vướng gì về giờ giấc nói rõ ở đây.',
  ],
  target: [
    'Chốt mục tiêu quý 1.5 tỷ. Mình phân bổ cho từng người, ai cam kết con số nào tháng này nói luôn.',
    'Giờ lấy cam kết: mỗi người một con số cụ thể cho tháng này, Duy ghi lại hết.',
  ],
  _default: ['Anh em mình vô việc. Ai có gì cần nêu thì nói thẳng.'],
}

// ── Duy lên tiếng khi người điều hành (bạn) gõ chỉ đạo ────────────────────────
function duyRespond(msg: string): string {
  const m = msg.replace(/\s+/g, ' ').trim()
  const patterns = [
    `“${m}” — ý này được. Duy chốt: tuần này triển khai luôn, ai liên quan báo anh ngay.`,
    `Duy nghe rồi: ${m}. Mình không bàn lý thuyết nữa, ai vướng chỗ nào nói thẳng ra.`,
    `Ok, về chuyện này — Dũng với Công nêu trước đi, mấy đứa còn lại bổ sung thêm.`,
    `${m}. Anh thấy đúng hướng, nhưng phải ra số — ai làm được tới đâu cam kết tới đó.`,
  ]
  return pick('duy_respond', patterns)
}

// ── Lời thoại từng thành viên (bám hồ sơ thật) ────────────────────────────────
const MEMBER_LINES: Record<string, string[]> = {
  huy: [
    'Hồ sơ cọc với pháp lý cứ để Huy lo, phần đó mình chắc tay. Còn khách mới thì Huy nhận là chưa mạnh.',
    'Huy nghĩ nên rủ nhau đi dẫn khách chung, ai kẹt đâu thấy liền chứ ngồi nói khó ra.',
    'Tháng này Huy đặt mục tiêu đi với Duy 2-3 buổi dẫn khách, chứ pháp lý không thì chưa đủ.',
    'Cái gì dính hợp đồng đặt cọc anh em cứ hỏi Huy, đừng để sai sót pháp lý mất khách.',
  ],
  tuan: [
    'Khách từ kênh review của Công về đều, vấn đề là chuyển thành lịch xem nhà. Cái đó Công làm được.',
    'Công nói thật, chăm khách cũ mình hơi hời hợt, bỏ lỡ vài deal đáng ra chốt. Sẽ siết lại.',
    'Lọc khách phải mạnh, đừng chiều. Công không ôm khách rác, tập trung khách thật mới ra số.',
    'Mấy đứa mới cứ theo Công một buổi dẫn khách là thấy cách chốt lịch liền.',
  ],
  huong: [
    'Dũng bán hơn 50 căn rồi, kinh nghiệm là phải khai thác đúng nhu cầu khách mới chốt nhanh.',
    'Nói thật, ai thiếu kỷ luật là kéo cả nhóm xuống. Làm nghề thì giờ giấc, báo nhà phải đều.',
    'Dũng nhập nhà lên Landsoft nhiều nhất, nhưng giờ phải xây tệp khách ruột chứ bán lẻ hoài mệt.',
    'Căn nào Dũng đang ôm sẽ cập nhật hết lên hệ thống, minh bạch cho anh em phối hợp.',
  ],
  luan: [
    'Luân bán được 2 căn nhờ đi với anh Duy. Giờ Luân muốn tự chốt không cần kè sát nữa.',
    'Em chịu khó tìm khách mới, nhưng làm giá với chủ còn yếu, chỗ đó em cần học thêm.',
    'Hồ sơ em đang theo rập rình, để em biến nó thành lịch hẹn rõ ràng tuần này.',
    'Em nhắm mốc 508 triệu, ráng tháng này chốt thêm một căn cho chắc thưởng.',
  ],
  tri: [
    'Dạo này sức khỏe Trí không ổn nên lên công ty trễ, Trí cố sắp xếp lại.',
    'Trí thì ký phí lẻ tẻ 3% thôi, khách lớn chưa có. Để Trí coi lại cách làm.',
    'Quy định thì Trí biết, nhưng nhà xa đi lại cực, Trí ráng đúng giờ hơn.',
    'Thôi việc gì làm được Trí làm, chứ ép quá Trí cũng khó.',
  ],
  mai: [
    'Thắng làm theo cách của Thắng, quan hệ môi giới ngoài cũng ra khách chứ bộ.',
    'Sao cứ nhắm vô Thắng? Người khác trễ thì không nói, Thắng trễ là bị réo.',
    'Video review tốn thời gian, Thắng thấy đăng tin với chạy quan hệ hiệu quả hơn.',
    'Muốn Thắng làm thì nói rõ quy chế ra, đừng nói chung chung rồi bắt lỗi.',
  ],
  khoa: [
    'Vụ hồ sơ vừa rồi em ôm lâu quá mới báo anh Duy, em rút kinh nghiệm, lần sau báo sớm.',
    'Em chấm công đều nhưng chưa có deal, em sốt ruột lắm, anh chỉ em bám khách kỹ hơn.',
    'Em với Thanh Duy định làm content đều trên FB với TikTok, kéo thêm khách cho nhóm.',
    'Có bước nào nhạy cảm em sẽ hỏi anh Duy trước chứ không tự xử nữa.',
  ],
  thanhduy: [
    'Clip vừa rồi được một triệu view, giờ em làm phễu để biến view thành lead đi xem nhà thật.',
    'Em nghĩ cả nhóm cùng quay review đều thì kênh mạnh hơn, em sẵn sàng hướng dẫn cách dựng.',
    'Nền hành chính Quận 10 giúp em tư vấn pháp lý nhẹ nhàng, khách tin hơn.',
    'Em làm content dài hạn, không chạy theo view ảo, mục tiêu là ra giao dịch.',
  ],
  duc: [
    'Duy nói thẳng: nhóm phải ra số, đừng để quý này trôi. Ai kẹt đâu báo anh gỡ đó.',
    'Anh gánh chỉ tiêu 1.5 tỷ, nhưng một mình anh không kéo nổi — cần anh em chủ động hơn.',
  ],
}

// ── Thành viên phản ứng trực tiếp khi Duy/người điều hành vừa nói ──────────────
function memberReact(personaId: string): string {
  // dùng chính pool của họ — đã rất đúng giọng — nhưng tránh lặp với lượt trước
  return pick(`react_${personaId}`, MEMBER_LINES[personaId] ?? ['Dạ em nghe rồi anh.'])
}

// ── Hàm chính: trả về một câu thoại offline ───────────────────────────────────
export function offlineSpeak(opts: {
  personaId: string
  topic: AgendaTopic
  isOpener: boolean
  leaderMsg?: string
}): string {
  const { personaId, topic, isOpener, leaderMsg } = opts
  if (personaId === 'duc' && leaderMsg) return duyRespond(leaderMsg)
  if (leaderMsg) return memberReact(personaId)
  if (personaId === 'duc' && isOpener) {
    return pick(`open_${topic.id}`, DUY_OPENERS[topic.id] ?? DUY_OPENERS._default)
  }
  return pick(`mem_${personaId}`, MEMBER_LINES[personaId] ?? ['Em đồng ý với hướng này anh.'])
}

// ── Thư ký: việc cần làm theo chủ đề ──────────────────────────────────────────
const ACTION_BY_TOPIC: Record<string, string[]> = {
  pipeline: [
    'Yêu cầu mỗi người gửi số khách và căn sắp chốt trước thứ Sáu này.',
    'Lập bảng pipeline chung, cập nhật khách nóng mỗi sáng.',
  ],
  'closing-skill': [
    'Đặt quy tắc báo trưởng nhóm ngay khi khách lung lay; lập lịch kèm 1-1 cho Luân và Khoa.',
    'Tổ chức buổi tập chốt mẫu cho người mới trong tuần này.',
  ],
  listings: [
    'Bắt buộc cập nhật toàn bộ nguồn nhà lên Landsoft, rà soát nguồn tuồn ra ngoài.',
    'Ra quy chế nguồn nội bộ trước; xử lý vụ chia 50-50 với cò vườn.',
  ],
  content: [
    'Lập nhóm content do Thanh Duy dẫn, đặt chỉ tiêu mỗi người 2 clip review/tuần.',
    'Xây phễu chuyển view TikTok thành lịch xem nhà.',
  ],
  discipline: [
    'Áp quy chế chấm công bằng bằng chứng; gặp riêng Thắng và Trí về thái độ.',
    'Chốt nội quy giờ giấc và mức phạt minh bạch, công bố cho cả nhóm.',
  ],
  target: [
    'Ghi nhận cam kết doanh số từng người, theo dõi tiến độ hằng tuần.',
    'Phân bổ chỉ tiêu 1.5 tỷ và dán bảng cam kết lên bảng chung.',
  ],
  _default: ['Giao việc cụ thể cho từng người và hẹn ngày kiểm tra lại.'],
}

export function offlineActionItem(topic: AgendaTopic): string {
  return pick(`act_${topic.id}`, ACTION_BY_TOPIC[topic.id] ?? ACTION_BY_TOPIC._default)
}

const INSIGHTS = [
  'Rủi ro: nhiều việc đều xoay quanh nhân viên giấu thông tin với sếp — đây là vấn đề văn hóa báo cáo, không phải kỹ năng.',
  'Cơ hội: thế mạnh content và nguồn nhà đang nằm rời rạc ở vài người — gom thành hệ thống sẽ kéo cả nhóm lên.',
  'Quy luật: người ít áp lực tài chính thường thiếu kỷ luật — phải gắn quyền lợi với cam kết, không chỉ nhắc nhở.',
]
export function offlineInsight(): string {
  return pick('insight', INSIGHTS)
}

const COACH_BY_PERSONA: Record<string, string> = {
  huy: 'Giao deadline 2 buổi dẫn khách chung trong tuần để lộ điểm kẹt.',
  tuan: 'Nói riêng, dựa trên số cơ hội bỏ lỡ ở khâu chăm khách cũ.',
  huong: 'Giao Dũng dựng quy trình chăm khách ruột cho cả nhóm.',
  luan: 'Giảm kè sát, giao Luân tự chốt một hồ sơ rồi báo kết quả.',
  tri: 'Nhắc bằng quy chế và bằng chứng chấm công, không cảm tính.',
  mai: 'Gặp riêng Thắng xử vụ Zalo 18/6, gắn quy chế nguồn hàng rõ ràng.',
  khoa: 'Khen sự siêng năng, lập lịch để Khoa hỏi sớm trước bước nhạy cảm.',
  thanhduy: 'Giao Thanh Duy dẫn dắt mảng content, gắn với chỉ tiêu lead.',
}
export function offlineCoach(memberLines: { id: string }[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const l of memberLines) {
    if (COACH_BY_PERSONA[l.id]) out[l.id] = COACH_BY_PERSONA[l.id]
  }
  return out
}
