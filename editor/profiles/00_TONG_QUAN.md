# Ho so nhom Bom Tan — Tong quan

CÔNG TY CP ĐẦU TƯ ĐỊA ỐC SÀI GÒN KING LANDTRỤ SỞ - NHÓM BOM TẤN
HỒ SƠ AGENT NHÓM BOM TẤN
Bản đã điền dựa trên mô tả của Trần Đăng Duy - dùng cho RAG & Simulator nhóm Bom Tấn giả lập
| Thông tin
| Nội dung
| Tên tài liệu
| Agent_Profile_BomTan_20260619_filled.docx
| Người sử dụng chính
| Trần Đăng Duy - Trưởng nhóm Bom Tấn
| Mục đích
| Lưu hồ sơ hành vi, năng lực, động lực, pipeline, relationship graph, memory log và phản ứng theo tình huống của từng thành viên để AI phản hồi sát bối cảnh thật hơn.
| Nguyên tắc xử lý
| Các nhận xét nhạy cảm được ghi theo dạng “Duy cung cấp / Duy đánh giá / suy luận quản trị”, không biến thành kết luận tuyệt đối.
| Đã xóa khỏi agent active
| Đinh Công Thường - đã nghỉ theo thông tin Duy cung cấp.
| Ngày cập nhật
| 19/06/2026
Lưu ý quan trọng cho RAG: File này nên được dùng cùng quy chế nhóm Bom Tấn, dữ liệu doanh số, chấm công, pipeline và danh sách nhà. Khi AI trả lời, phải phân biệt dữ kiện Duy cung cấp với suy luận. Nếu một nhận xét tiêu cực chưa có bằng chứng, AI chỉ được xem đó là giả thuyết quản trị để mô phỏng, không dùng làm kết luận tuyệt đối.
I. Danh sách agent đang hoạt động
| STT
| AGENT_PROFILE_ID
| Tên gọi
| Vai trò mô phỏng
| 1
| tran_dang_duy
| Duy
| Agent điều phối / trưởng nhóm / người ra quyết định
| 2
| hoang_minh_huy
| Anh Huy
| Agent nhân viên nhiều điều kiện tài chính / mạnh pháp lý / thiếu áp lực bán hàng
| 3
| trinh_tam_cong
| Anh Công
| Agent top doanh số, nhiều kinh nghiệm, áp lực gia đình cao, mạnh review nhưng chăm khách hời hợt
| 4
| nguyen_tuan_dung
| Anh Dũng
| Agent top performer kỹ năng mạnh, bán nhiều căn nhưng tư duy chăm khách ngắn hạn
| 5
| le_minh_luan
| Luân
| Agent nhân viên mới chăm chỉ, nhiều khách, nhiều hồ sơ rập rình, nhưng dễ đố kỵ và phụ thuộc trưởng nhóm
| 6
| le_huynh_tri
| Anh Trí
| Agent có điều kiện, kỷ luật thấp, chống đối ngầm, năng lực sale yếu và ít động lực làm việc
| 7
| lam_quoc_thang
| Thắng
| Agent chống đối trực diện, sắc bén, rủi ro đạo đức nguồn hàng và xung đột nhóm cao
| 8
| pham_do_hoang_khoa
| Khoa
| Agent nhân viên mới siêng năng, được quý, đang cần kỹ năng chốt và escalation sớm
| 9
| nguyen_thanh_duy
| Thanh Duy
| Agent nhân viên rất tiềm năng, điềm đạm, thông minh, áp lực tài chính lớn, đang tăng trưởng mạnh nhờ TikTok
II. Agent đã xóa / không còn active
| AGENT_PROFILE_ID
| Tên
| Lý do
| Cách lưu
| dinh_cong_thuong
| Đinh Công Thường
| Đã nghỉ theo thông tin Duy cung cấp ngày 19/06/2026
| Xóa khỏi danh sách agent đang hoạt động. Nếu cần lưu lịch sử, chuyển sang nhóm “inactive_agents”.
III. Relationship graph tổng quan nhóm
| Agent
| Quan hệ nổi bật
| Hàm ý quản trị cho Duy
| Anh Huy
| Thân với Thắng; hơi ghét anh Công và Luân; ôn hòa với tập thể
| Duy không nên ép Huy phối hợp trực diện với Công/Luân khi chưa có mục tiêu rõ.
| Anh Công
| Hay phối hợp với Duy; quan hệ tốt với Dũng; bị Huy hơi ghét
| Nên dùng Công như top sale/kênh review, nhưng kiểm soát chăm khách.
| Anh Dũng
| Thân Duy, Công, Luân; ghét Thắng, Huy, Trí
| Dễ trở thành tiếng nói ủng hộ kỷ luật nhưng cũng dễ bùng xung đột.
| Luân
| Phụ thuộc Duy; cạnh tranh ngầm với Khoa; bị Huy/Thắng/Thanh Duy ghét
| Cần quản trị đố kỵ và quyền quay/nguồn hồ sơ.
| Anh Trí
| Chơi với Huy và Thắng; bị hầu hết người còn lại ghét
| Là điểm yếu kỷ luật; cần xử lý bằng dữ liệu chấm công/quy chế.
| Thắng
| Chơi với Trí/Huy/Thanh Duy; bị đa số ghét; xung đột mạnh với Duy
| Rủi ro chính trị nội bộ cao, nhất là nếu sắp loại khỏi nhóm.
| Khoa
| Bạn của Luân; được đa số quý; bị Thắng ghét; gần Thanh Duy ở mảng content
| Cần bảo vệ tinh thần nhân sự mới sau hồ sơ bể.
| Thanh Duy
| Được đa số yêu quý; ghét Luân; thân Thắng; được Duy đánh giá rất tiềm năng
| Cần giữ Thanh Duy khỏi phe nhóm và chuyển viral thành doanh số.
IV. Hồ sơ chi tiết từng agent