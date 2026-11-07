use super::dto::{GeneratePosterRequest, PosterTemplateInfo};

pub struct PosterEngine;

impl PosterEngine {
    pub fn get_available_templates() -> Vec<PosterTemplateInfo> {
        vec![
            PosterTemplateInfo {
                id: "emerald_modern".to_string(),
                name: "Emerald Hijriyah Modern".to_string(),
                description: "Template elegan bertema hijau zamrud dengan ornamen kaligrafi dan tipografi tegas.".to_string(),
                supported_ratios: vec!["1:1".to_string(), "9:16".to_string()],
                preview_thumbnail: "/templates/emerald.png".to_string(),
            },
            PosterTemplateInfo {
                id: "navy_gold".to_string(),
                name: "Midnight Navy & Gold".to_string(),
                description: "Nuansa malam biru gelap dengan aksen emas khusus kajian akbar dan tabligh akbar.".to_string(),
                supported_ratios: vec!["1:1".to_string(), "9:16".to_string()],
                preview_thumbnail: "/templates/navy_gold.png".to_string(),
            },
        ]
    }

    pub fn render_svg(req: &GeneratePosterRequest) -> String {
        let is_story = req.aspect_ratio == "9:16";
        let width = 1080;
        let height = if is_story { 1920 } else { 1080 };

        let (badge_bg, badge_text, badge_color) = match req.status_type.as_str() {
            "cancelled" => ("#dc2626", "KAJIAN DILIBURKAN SEMENTARA", "#ffffff"),
            "special" => ("#d97706", "KAJIAN SPESIAL / TABLIGH AKBAR", "#ffffff"),
            _ => ("#16a34a", "KAJIAN RUTIN TERBUKA UNTUK UMUM", "#ffffff"),
        };

        let cancellation_notice = if req.status_type == "cancelled" {
            let reason = req.cancellation_reason.as_deref().unwrap_or("Ustadz berhalangan hadir");
            format!(
                r##"<rect x="140" y="{}" width="800" height="90" rx="16" fill="#fef2f2" stroke="#f87171" stroke-width="2"/>
                <text x="540" y="{}" fill="#991b1b" font-family="'Inter', sans-serif" font-weight="bold" font-size="22" text-anchor="middle">PEMBERITAHUAN: {}</text>"##,
                if is_story { 1100 } else { 620 },
                if is_story { 1155 } else { 675 },
                reason
            )
        } else {
            "".to_string()
        };

        let y_offset: i32 = if is_story { 200 } else { 0 };

        format!(
            r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <pattern id="islamicPattern" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 30,0 L 60,30 L 30,60 L 0,30 Z" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1.5"/>
      <circle cx="30" cy="30" r="10" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1.5"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="{width}" height="{height}" fill="url(#bgGrad)"/>
  <rect width="{width}" height="{height}" fill="url(#islamicPattern)"/>

  <!-- Border Ornamen -->
  <rect x="40" y="40" width="{border_w}" height="{border_h}" rx="24" fill="none" stroke="rgba(22, 163, 74, 0.4)" stroke-width="2"/>
  <rect x="52" y="52" width="{border_inner_w}" height="{border_inner_h}" rx="20" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>

  <!-- Header: Basmalah -->
  <text x="540" y="{y_basmalah}" fill="#a7f3d0" font-family="'Inter', sans-serif" font-weight="600" font-size="24" text-anchor="middle" letter-spacing="4">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</text>

  <!-- Status Badge -->
  <rect x="{badge_x}" y="{y_badge}" width="{badge_w}" height="48" rx="24" fill="{badge_bg}"/>
  <text x="540" y="{y_badge_text}" fill="{badge_color}" font-family="'Inter', sans-serif" font-weight="bold" font-size="15" text-anchor="middle" letter-spacing="1.5">{badge_text}</text>

  <!-- Title (Judul Kajian) -->
  <text x="540" y="{y_title}" fill="#ffffff" font-family="'Inter', sans-serif" font-weight="900" font-size="52" text-anchor="middle">
    {title}
  </text>

  <!-- Speaker Name -->
  <text x="540" y="{y_speaker_label}" fill="#6ee7b7" font-family="'Inter', sans-serif" font-weight="bold" font-size="20" text-anchor="middle" letter-spacing="2">BERSAMA PEMATERI:</text>
  <text x="540" y="{y_speaker}" fill="#fef08a" font-family="'Inter', sans-serif" font-weight="bold" font-size="38" text-anchor="middle">{speaker}</text>

  <!-- Cancellation Notice (if cancelled) -->
  {cancellation_notice}

  <!-- Event Details Box -->
  <rect x="140" y="{y_details_box}" width="800" height="{details_box_h}" rx="20" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>

  <!-- Details Content -->
  <text x="180" y="{y_date}" fill="#ffffff" font-family="'Inter', sans-serif" font-weight="bold" font-size="24">📅 {date_text}</text>
  <text x="180" y="{y_time}" fill="#e2e8f0" font-family="'Inter', sans-serif" font-weight="medium" font-size="22">⏰ {time_text}</text>
  <text x="180" y="{y_loc}" fill="#93c5fd" font-family="'Inter', sans-serif" font-weight="bold" font-size="22">📍 {location}</text>

  <!-- Footer Branding -->
  <text x="540" y="{y_footer}" fill="rgba(255,255,255,0.5)" font-family="'Inter', sans-serif" font-weight="medium" font-size="16" text-anchor="middle">
    DIBUAT DENGAN TARI (TATA ORGANISASI) — MULTI-TENANT SAAS
  </text>
</svg>"##,
            width = width,
            height = height,
            border_w = width - 80,
            border_h = height - 80,
            border_inner_w = width - 104,
            border_inner_h = height - 104,
            y_basmalah = 120 + y_offset,
            badge_x = 540 - 200,
            badge_w = 400,
            y_badge = 170 + y_offset,
            badge_bg = badge_bg,
            badge_color = badge_color,
            y_badge_text = 200 + y_offset,
            badge_text = badge_text,
            y_title = 290 + y_offset,
            title = req.title,
            y_speaker_label = 380 + y_offset,
            y_speaker = 430 + y_offset,
            speaker = req.speaker,
            cancellation_notice = cancellation_notice,
            y_details_box = if req.status_type == "cancelled" { 510 + y_offset + 90 } else { 510 + y_offset },
            details_box_h = 160,
            y_date = if req.status_type == "cancelled" { 560 + y_offset + 90 } else { 560 + y_offset },
            date_text = req.date_text,
            y_time = if req.status_type == "cancelled" { 605 + y_offset + 90 } else { 605 + y_offset },
            time_text = req.time_text,
            y_loc = if req.status_type == "cancelled" { 650 + y_offset + 90 } else { 650 + y_offset },
            location = req.location,
            y_footer = height - 70
        )
    }
}

