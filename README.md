# Markdown Preview

A premium VS Code / Antigravity extension designed for Prompt Engineers.

[Tiếng Việt](#tiếng-việt) | [English](#english)

---

## Tiếng Việt

Phần mở rộng cao cấp dành cho VS Code / Antigravity, được tối ưu hóa cho các chuyên gia kỹ thuật Prompt (Prompt Engineers). Cung cấp giao diện xem trước Markdown tuyệt đẹp, đồng bộ với giao diện IDE, hỗ trợ phản hồi và tích hợp Agent.

### ✨ Tính năng nổi bật

- **Giao diện Cao cấp**: Thiết kế phẳng, hiện đại, hòa quyện hoàn hảo với theme của IDE.
- **Phản hồi Thông minh**: Thêm nhận xét trực tiếp vào từng khối văn bản/mã nguồn ngay trong bản xem trước.
- **Tích hợp Chat**: Gửi trực tiếp yêu cầu phản hồi vào khung chat của Antigravity/Cursor Agent.
- **Biểu đồ Mermaid Đồng bộ**: Hỗ trợ vẽ biểu đồ Mermaid với màu sắc tự động điều chỉnh theo theme Dark/Light của IDE.
- **Hỗ trợ Carousel ảnh**: Tạo các bộ sưu tập ảnh tương tác bằng cú pháp `carousel`.
- **Header Gọn gàng**: Thanh điều hướng tối ưu với các nút truy cập nhanh (Copy Raw, Edit, Submit).
- **Khối mã nguồn Tương tác**: Sao chép mã nguồn chỉ với một nhấp chuột.
- **Chất lượng Thị giác**: Hình ảnh được bo góc, đổ bóng và hiệu ứng hover tinh tế.

### 📦 Có gì mới (v1.1.1)

- **Bảng chuyên nghiệp**: Hỗ trợ render bảng với kẻ dọc, màu xen kẽ, hiệu ứng hover và thanh cuộn responsive.
- **Tích hợp Mermaid**: Loại bỏ nền trắng, tự động đổi màu theo theme IDE.
- **Hỗ trợ Carousel**: Sử dụng khối mã `carousel` và `<!-- slide -->` để tạo thư viện ảnh.
- **Bố cục Tối ưu**: Xử lý thông minh vị trí nút comment cho các khối bảng và carousel để không bị cắt mất.

### ⚙️ Cấu hình Editor Associations

Để đảm bảo các file Artifact (như Implementation Plan, Task) được mở bằng trình soạn thảo chuyên dụng của Antigravity, bạn nên thêm cấu hình sau vào `settings.json` của VS Code:

```json
"workbench.editorAssociations": {
    "**/implementation_plan*.md": "antigravity.artifactsEditorInput",
    "**/task.md": "antigravity.artifactsEditorInput",
    "**/walkthrough*.md": "antigravity.artifactsEditorInput",
    "**/*.md": "promptagentPreview"
}
```

### 🚀 Bắt đầu sử dụng

1. Mở bất kỳ file Markdown (`.md`) nào.
2. Bảng xem trước sẽ tự động mở (hoặc Chuột phải -> Open With -> PromptAgent Preview).
3. Di chuột qua các khối nội dung để thấy nút "Add Comment".
4. Nhấn "Submit Comments" để gửi yêu cầu cho Agent.

> [!TIP]
> Khuyến khích sử dụng cùng với bộ [PromptAgent](https://github.com/Manh-Huynh-PP/PromptAgent) để có trải nghiệm tốt nhất.

### 📚 Tài liệu tham khảo
- [Ultimate Prompting Guide for Nano Banana](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Ultimate Prompting Guide for Veo 3.1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1)

---

## English

Premium VS Code / Antigravity extension optimized for Prompt Engineers. Provides a stunning, theme-aware Markdown preview for reviewing and commenting on prompts.

### ✨ Key Features

- **Premium UI**: Modern, flat design that blends seamlessly with your IDE theme.
- **Professional Tables**: Enhanced table rendering with vertical borders, zebra-striping, and hover effects.
- **Smart Feedback**: Add comments directly to blocks of text/code in the preview.
- **Direct Chat Injection**: Submit your feedback directly to the Antigravity/Cursor Agent chat.
- **Themed Mermaid Diagrams**: Native Mermaid support that automatically matches your IDE's theme.
- **Image Carousels**: Support for interactive image carousels using `carousel` code blocks.

### 📦 What's New (v1.1.1)

- **Advanced Tables**: Professional data layout with responsive scroll and vertical column borders.
- **Mermaid Integration**: No more white backgrounds! Fully theme-aware rendering.
- **Carousel Support**: Use `carousel` blocks with `<!-- slide -->` to create galleries.
- **Optimized Layout**: Resolved comment button clipping in tables and nested containers.

### ⚙️ Editor Associations Configuration

To ensure AI Artifacts (like Implementation Plans and Tasks) open with Antigravity's specialized editors, add this to your `settings.json`:

```json
"workbench.editorAssociations": {
    "**/implementation_plan*.md": "antigravity.artifactsEditorInput",
    "**/task.md": "antigravity.artifactsEditorInput",
    "**/walkthrough*.md": "antigravity.artifactsEditorInput",
    "**/*.md": "promptagentPreview"
}
```

### 🚀 Getting Started

1. Open any Markdown (`.md`) file.
2. Preview panel opens automatically (or right-click -> Open With -> PromptAgent Preview).
3. Hover over blocks to see the "Add Comment" button.
4. Click "Submit Comments" to send feedback to the Agent.

> [!TIP]
> Best used with the [PromptAgent](https://github.com/Manh-Huynh-PP/PromptAgent) system for seamless prompt engineering.

### 📚 References
- [Ultimate Prompting Guide for Nano Banana](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Ultimate Prompting Guide for Veo 3.1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1)

---

*Developed by **Manh Huynh***
🌐 Website: [manhhuynh.work](https://manhhuynh.work)
📧 Email: [contact@manhhuynh.work](mailto:contact@manhhuynh.work)
