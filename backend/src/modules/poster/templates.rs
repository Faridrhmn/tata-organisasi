use super::dto::{
    GeneratePosterRequest, PosterElementLayout, PosterFontOption, PosterLayoutConfig,
    PosterTemplateInfo, PosterTextAlign,
};

pub struct PosterEngine;

struct ResolvedLayout {
    basmalah: PosterElementLayout,
    badge: PosterElementLayout,
    title: PosterElementLayout,
    speaker_label: PosterElementLayout,
    speaker: PosterElementLayout,
    cancellation_notice: PosterElementLayout,
    details_box: PosterElementLayout,
    footer: PosterElementLayout,
}

impl PosterEngine {
    pub fn get_available_fonts() -> Vec<PosterFontOption> {
        let entries = [
            ("noto-sans-local", "Noto Sans (Lokal)", "'Noto Sans Local', sans-serif", "Sans Modern", "local"),
            ("noto-display-local", "Noto Display Black (Lokal)", "'Noto Display Local', sans-serif", "Display Tegas", "local"),
            ("noto-serif-local", "Noto Serif (Lokal)", "'Noto Serif Local', serif", "Serif Elegan", "local"),
            ("noto-naskh-arabic-local", "Noto Naskh Arabic (Lokal)", "'Noto Naskh Arabic Local', serif", "Arab / Kaligrafi", "local"),
            ("noto-kufi-arabic-local", "Noto Kufi Arabic (Lokal)", "'Noto Kufi Arabic Local', serif", "Arab / Kaligrafi", "local"),
            ("inter", "Inter", "'Inter', sans-serif", "Sans Modern", "google"),
            ("plus-jakarta-sans", "Plus Jakarta Sans", "'Plus Jakarta Sans', sans-serif", "Sans Modern", "google"),
            ("poppins", "Poppins", "'Poppins', sans-serif", "Sans Modern", "google"),
            ("montserrat", "Montserrat", "'Montserrat', sans-serif", "Sans Modern", "google"),
            ("playfair-display", "Playfair Display", "'Playfair Display', serif", "Serif Elegan", "google"),
            ("cinzel", "Cinzel", "'Cinzel', serif", "Serif Elegan", "google"),
            ("merriweather", "Merriweather", "'Merriweather', serif", "Serif Elegan", "google"),
            ("bebas-neue", "Bebas Neue", "'Bebas Neue', sans-serif", "Display Tegas", "google"),
            ("oswald", "Oswald", "'Oswald', sans-serif", "Display Tegas", "google"),
            ("amiri", "Amiri (Kaligrafi Arab)", "'Amiri', serif", "Arab / Kaligrafi", "google"),
        ];

        entries
            .into_iter()
            .map(|(id, label, family, category, source)| PosterFontOption {
                id: id.to_string(),
                label: label.to_string(),
                family: family.to_string(),
                category: category.to_string(),
                source: source.to_string(),
            })
            .collect()
    }

    pub fn get_available_templates() -> Vec<PosterTemplateInfo> {
        vec![
            PosterTemplateInfo {
                id: "emerald_modern".to_string(),
                name: "Emerald Classic (Islami Elegan)".to_string(),
                description: "Template elegan bertema hijau zamrud dengan ornamen kaligrafi dan tipografi dinamis.".to_string(),
                supported_ratios: vec!["1:1".to_string(), "9:16".to_string()],
                preview_thumbnail: "/templates/emerald.png".to_string(),
                default_layout_feed: Self::default_layout_config("emerald_modern", false),
                default_layout_story: Self::default_layout_config("emerald_modern", true),
            },
            PosterTemplateInfo {
                id: "modern_minimal".to_string(),
                name: "Modern Minimalist (Clean White)".to_string(),
                description: "Desain bersih bernuansa putih dengan tipografi tegas untuk kajian pemuda dan umum.".to_string(),
                supported_ratios: vec!["1:1".to_string(), "9:16".to_string()],
                preview_thumbnail: "/templates/modern.png".to_string(),
                default_layout_feed: Self::default_layout_config("modern_minimal", false),
                default_layout_story: Self::default_layout_config("modern_minimal", true),
            },
            PosterTemplateInfo {
                id: "navy_gold".to_string(),
                name: "Midnight Gold (Tabligh Akbar)".to_string(),
                description: "Nuansa malam biru gelap dengan aksen emas dan serif klasik khusus tabligh akbar.".to_string(),
                supported_ratios: vec!["1:1".to_string(), "9:16".to_string()],
                preview_thumbnail: "/templates/navy_gold.png".to_string(),
                default_layout_feed: Self::default_layout_config("navy_gold", false),
                default_layout_story: Self::default_layout_config("navy_gold", true),
            },
            PosterTemplateInfo {
                id: "sunset_warm".to_string(),
                name: "Sunset Warm (Shubuh & Sosial)".to_string(),
                description: "Palet hangat jingga-cokelat untuk agenda kajian shubuh dan kegiatan sosial.".to_string(),
                supported_ratios: vec!["1:1".to_string(), "9:16".to_string()],
                preview_thumbnail: "/templates/sunset.png".to_string(),
                default_layout_feed: Self::default_layout_config("sunset_warm", false),
                default_layout_story: Self::default_layout_config("sunset_warm", true),
            },
        ]
    }

    fn default_layout_config(template_id: &str, is_story: bool) -> PosterLayoutConfig {
        let resolved = Self::default_resolved_layout(template_id, is_story);
        PosterLayoutConfig {
            basmalah: Some(resolved.basmalah),
            badge: Some(resolved.badge),
            title: Some(resolved.title),
            speaker_label: Some(resolved.speaker_label),
            speaker: Some(resolved.speaker),
            cancellation_notice: Some(resolved.cancellation_notice),
            details_box: Some(resolved.details_box),
            footer: Some(resolved.footer),
        }
    }

    fn default_resolved_layout(template_id: &str, is_story: bool) -> ResolvedLayout {
        let is_light = template_id == "modern_minimal" || template_id == "tmpl-modern";
        let is_midnight = template_id == "navy_gold" || template_id == "midnight_gold" || template_id == "tmpl-midnight";
        let is_sunset = template_id == "sunset_warm" || template_id == "tmpl-sunset";

        let title_font = if is_midnight {
            "'Cinzel', 'Noto Serif Local', serif"
        } else if is_sunset {
            "'Oswald', 'Noto Display Local', sans-serif"
        } else if is_light {
            "'Montserrat', 'Noto Sans Local', sans-serif"
        } else {
            "'Plus Jakarta Sans', 'Noto Sans Local', sans-serif"
        };

        let speaker_font = if is_midnight || (!is_light && !is_sunset) {
            "'Playfair Display', 'Noto Serif Local', serif"
        } else {
            "'Poppins', 'Noto Sans Local', sans-serif"
        };

        let arabic_font = if is_sunset {
            "'Noto Kufi Arabic Local', serif"
        } else {
            "'Amiri', 'Noto Naskh Arabic Local', serif"
        };

        let body_font = "'Inter', 'Noto Sans Local', sans-serif";

        let details_bg = if is_light {
            "rgba(255, 255, 255, 0.92)"
        } else if is_midnight {
            "rgba(2, 6, 23, 0.85)"
        } else if is_sunset {
            "rgba(69, 26, 3, 0.8)"
        } else {
            "rgba(15, 23, 42, 0.78)"
        };

        ResolvedLayout {
            basmalah: PosterElementLayout {
                x: 540.0,
                y: if is_story { 250.0 } else { 112.0 },
                font_family: arabic_font.to_string(),
                font_size: if is_story { 34.0 } else { 30.0 },
                font_weight: "700".to_string(),
                color: if is_light { "#047857" } else { "#a7f3d0" }.to_string(),
                align: PosterTextAlign::Center,
                letter_spacing: 1.0,
                max_width: 860.0,
                visible: true,
                background_color: None,
                border_color: None,
            },
            badge: PosterElementLayout {
                x: 540.0,
                y: if is_story { 310.0 } else { 156.0 },
                font_family: body_font.to_string(),
                font_size: 15.0,
                font_weight: "700".to_string(),
                color: "#ffffff".to_string(),
                align: PosterTextAlign::Center,
                letter_spacing: 1.5,
                max_width: 440.0,
                visible: true,
                background_color: None,
                border_color: None,
            },
            title: PosterElementLayout {
                x: 540.0,
                y: if is_story { 460.0 } else { 278.0 },
                font_family: title_font.to_string(),
                font_size: if is_story { 54.0 } else { 46.0 },
                font_weight: "800".to_string(),
                color: if is_light { "#0f172a" } else { "#ffffff" }.to_string(),
                align: PosterTextAlign::Center,
                letter_spacing: if is_sunset { 1.5 } else { 0.0 },
                max_width: 880.0,
                visible: true,
                background_color: None,
                border_color: None,
            },
            speaker_label: PosterElementLayout {
                x: 540.0,
                y: if is_story { 690.0 } else { 422.0 },
                font_family: body_font.to_string(),
                font_size: 19.0,
                font_weight: "700".to_string(),
                color: if is_light { "#64748b" } else { "#6ee7b7" }.to_string(),
                align: PosterTextAlign::Center,
                letter_spacing: 2.0,
                max_width: 800.0,
                visible: true,
                background_color: None,
                border_color: None,
            },
            speaker: PosterElementLayout {
                x: 540.0,
                y: if is_story { 748.0 } else { 472.0 },
                font_family: speaker_font.to_string(),
                font_size: if is_story { 44.0 } else { 38.0 },
                font_weight: "700".to_string(),
                color: if is_light {
                    "#047857"
                } else if is_midnight {
                    "#fbbf24"
                } else {
                    "#fef08a"
                }
                .to_string(),
                align: PosterTextAlign::Center,
                letter_spacing: 0.0,
                max_width: 880.0,
                visible: true,
                background_color: None,
                border_color: None,
            },
            cancellation_notice: PosterElementLayout {
                x: 540.0,
                y: if is_story { 840.0 } else { 520.0 },
                font_family: body_font.to_string(),
                font_size: 20.0,
                font_weight: "700".to_string(),
                color: "#991b1b".to_string(),
                align: PosterTextAlign::Center,
                letter_spacing: 0.0,
                max_width: 800.0,
                visible: true,
                background_color: Some("#fef2f2".to_string()),
                border_color: Some("#f87171".to_string()),
            },
            details_box: PosterElementLayout {
                x: 540.0,
                y: if is_story { 960.0 } else { 620.0 },
                font_family: body_font.to_string(),
                font_size: 23.0,
                font_weight: "700".to_string(),
                color: if is_light { "#0f172a" } else { "#ffffff" }.to_string(),
                align: PosterTextAlign::Left,
                letter_spacing: 0.0,
                max_width: 800.0,
                visible: true,
                background_color: Some(details_bg.to_string()),
                border_color: Some(
                    if is_light {
                        "rgba(15, 23, 42, 0.12)"
                    } else {
                        "rgba(255, 255, 255, 0.18)"
                    }
                    .to_string(),
                ),
            },
            footer: PosterElementLayout {
                x: 540.0,
                y: if is_story { 1810.0 } else { 1015.0 },
                font_family: body_font.to_string(),
                font_size: 15.0,
                font_weight: "600".to_string(),
                color: if is_light {
                    "rgba(15, 23, 42, 0.45)"
                } else {
                    "rgba(255, 255, 255, 0.55)"
                }
                .to_string(),
                align: PosterTextAlign::Center,
                letter_spacing: 1.0,
                max_width: 900.0,
                visible: true,
                background_color: None,
                border_color: None,
            },
        }
    }

    fn resolve_layout(template_id: &str, is_story: bool, custom: Option<&PosterLayoutConfig>) -> ResolvedLayout {
        let mut base = Self::default_resolved_layout(template_id, is_story);
        if let Some(cfg) = custom {
            if let Some(v) = &cfg.basmalah {
                base.basmalah = v.clone();
            }
            if let Some(v) = &cfg.badge {
                base.badge = v.clone();
            }
            if let Some(v) = &cfg.title {
                base.title = v.clone();
            }
            if let Some(v) = &cfg.speaker_label {
                base.speaker_label = v.clone();
            }
            if let Some(v) = &cfg.speaker {
                base.speaker = v.clone();
            }
            if let Some(v) = &cfg.cancellation_notice {
                base.cancellation_notice = v.clone();
            }
            if let Some(v) = &cfg.details_box {
                base.details_box = v.clone();
            }
            if let Some(v) = &cfg.footer {
                base.footer = v.clone();
            }
        }
        base
    }

    fn escape_xml(input: &str) -> String {
        input
            .replace('&', "&amp;")
            .replace('<', "&lt;")
            .replace('>', "&gt;")
            .replace('"', "&quot;")
            .replace('\'', "&apos;")
    }

    fn is_safe_image_url(url: &str) -> bool {
        let trimmed = url.trim();
        trimmed.starts_with("data:image/")
            || trimmed.starts_with("https://")
            || trimmed.starts_with("http://")
    }

    fn wrap_text(text: &str, max_width: f64, font_size: f64, letter_spacing: f64) -> Vec<String> {
        let trimmed = text.trim();
        if trimmed.is_empty() {
            return vec![String::new()];
        }
        let approx_char_w = (font_size * 0.56) + letter_spacing.max(0.0);
        let max_chars = ((max_width.max(160.0)) / approx_char_w.max(6.0)).floor() as usize;
        let max_chars = max_chars.max(10);

        let mut lines = Vec::new();
        for para in trimmed.lines() {
            let mut current = String::new();
            for word in para.split_whitespace() {
                if current.is_empty() {
                    current.push_str(word);
                } else if current.chars().count() + 1 + word.chars().count() <= max_chars {
                    current.push(' ');
                    current.push_str(word);
                } else {
                    lines.push(current);
                    current = word.to_string();
                }
            }
            if !current.is_empty() {
                lines.push(current);
            }
        }
        if lines.is_empty() {
            lines.push(String::new());
        }
        lines
    }

    fn render_multiline_text(text: &str, layout: &PosterElementLayout, line_mult: f64) -> String {
        let lines = Self::wrap_text(text, layout.max_width, layout.font_size, layout.letter_spacing);
        let line_h = (layout.font_size * line_mult).round();
        let tspans: String = lines
            .iter()
            .enumerate()
            .map(|(idx, line)| {
                let dy = if idx == 0 { 0.0 } else { line_h };
                format!(
                    r#"<tspan x="{x}" dy="{dy}">{text}</tspan>"#,
                    x = layout.x,
                    dy = dy,
                    text = Self::escape_xml(line)
                )
            })
            .collect();

        format!(
            r#"<text x="{x}" y="{y}" fill="{color}" font-family="{font}" font-weight="{weight}" font-size="{size}" text-anchor="{anchor}" letter-spacing="{ls}">{tspans}</text>"#,
            x = layout.x,
            y = layout.y,
            color = Self::escape_xml(&layout.color),
            font = Self::escape_xml(&layout.font_family),
            weight = Self::escape_xml(&layout.font_weight),
            size = layout.font_size,
            anchor = layout.align.as_svg_anchor(),
            ls = layout.letter_spacing,
            tspans = tspans
        )
    }

    pub fn render_svg(req: &GeneratePosterRequest) -> String {
        let is_story = req.aspect_ratio == "9:16";
        let width: f64 = 1080.0;
        let height: f64 = if is_story { 1920.0 } else { 1080.0 };
        let layout = Self::resolve_layout(&req.template_id, is_story, req.layout.as_ref());

        let (default_badge_bg, badge_text) = match req.status_type.as_str() {
            "cancelled" => ("#dc2626", "KAJIAN DILIBURKAN SEMENTARA"),
            "special" => ("#d97706", "KAJIAN SPESIAL / TABLIGH AKBAR"),
            _ => ("#16a34a", "KAJIAN RUTIN TERBUKA UNTUK UMUM"),
        };

        let is_light = req.template_id == "modern_minimal" || req.template_id == "tmpl-modern";
        let is_midnight = req.template_id == "navy_gold"
            || req.template_id == "midnight_gold"
            || req.template_id == "tmpl-midnight";
        let is_sunset = req.template_id == "sunset_warm" || req.template_id == "tmpl-sunset";

        // Background layer
        let bg_layer = if let Some(bg_url) = req.background_image_url.as_deref().filter(|u| Self::is_safe_image_url(u)) {
            format!(
                r#"<image href="{url}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice"/>"#,
                url = Self::escape_xml(bg_url),
                w = width,
                h = height
            )
        } else if is_light {
            format!(
                r##"<rect width="{w}" height="{h}" fill="url(#gradModern)"/>
                <rect x="30" y="30" width="{bw}" height="{bh}" rx="16" fill="none" stroke="rgba(15, 23, 42, 0.08)" stroke-width="3"/>"##,
                w = width,
                h = height,
                bw = width - 60.0,
                bh = height - 60.0
            )
        } else if is_midnight {
            format!(
                r##"<rect width="{w}" height="{h}" fill="url(#gradMidnight)"/>
                <rect x="40" y="40" width="{bw}" height="{bh}" rx="24" fill="none" stroke="rgba(251, 191, 36, 0.3)" stroke-width="2"/>"##,
                w = width,
                h = height,
                bw = width - 80.0,
                bh = height - 80.0
            )
        } else if is_sunset {
            format!(
                r##"<rect width="{w}" height="{h}" fill="url(#gradSunset)"/>
                <rect x="40" y="40" width="{bw}" height="{bh}" rx="24" fill="none" stroke="rgba(251, 146, 60, 0.3)" stroke-width="2"/>"##,
                w = width,
                h = height,
                bw = width - 80.0,
                bh = height - 80.0
            )
        } else {
            format!(
                r##"<rect width="{w}" height="{h}" fill="url(#gradEmerald)"/>
                <rect width="{w}" height="{h}" fill="url(#islamicPattern)"/>
                <rect x="40" y="40" width="{bw}" height="{bh}" rx="24" fill="none" stroke="rgba(22, 163, 74, 0.4)" stroke-width="2"/>
                <rect x="52" y="52" width="{ibw}" height="{ibh}" rx="20" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>"##,
                w = width,
                h = height,
                bw = width - 80.0,
                bh = height - 80.0,
                ibw = width - 104.0,
                ibh = height - 104.0
            )
        };

        // Logo clip paths & images
        let mut logo_clips = String::new();
        let mut logos_svg = String::new();
        for logo in req.logos.iter().filter(|l| l.visible && Self::is_safe_image_url(&l.image_url)) {
            let safe_id = Self::escape_xml(&logo.id);
            let clip_attr = if logo.border_radius > 0.0 {
                logo_clips.push_str(&format!(
                    r#"<clipPath id="logo-clip-{id}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" ry="{r}"/></clipPath>"#,
                    id = safe_id,
                    x = logo.x,
                    y = logo.y,
                    w = logo.width,
                    h = logo.height,
                    r = logo.border_radius
                ));
                format!(r#" clip-path="url(#logo-clip-{id})""#, id = safe_id)
            } else {
                String::new()
            };

            logos_svg.push_str(&format!(
                r#"<image href="{url}" x="{x}" y="{y}" width="{w}" height="{h}" opacity="{op}" preserveAspectRatio="xMidYMid meet"{clip}/>"#,
                url = Self::escape_xml(&logo.image_url),
                x = logo.x,
                y = logo.y,
                w = logo.width,
                h = logo.height,
                op = logo.opacity.clamp(0.0, 1.0),
                clip = clip_attr
            ));
        }

        let basmalah_svg = if layout.basmalah.visible {
            Self::render_multiline_text("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", &layout.basmalah, 1.24)
        } else {
            String::new()
        };

        let badge_svg = if layout.badge.visible {
            let badge_w = layout.badge.max_width.clamp(260.0, 900.0);
            let badge_left = match layout.badge.align {
                PosterTextAlign::Center => layout.badge.x - badge_w / 2.0,
                PosterTextAlign::Right => layout.badge.x - badge_w,
                PosterTextAlign::Left => layout.badge.x,
            };
            let badge_fill = layout
                .badge
                .background_color
                .as_deref()
                .unwrap_or(default_badge_bg);
            format!(
                r#"<rect x="{x}" y="{y}" width="{w}" height="48" rx="24" fill="{bg}"/>
                <text x="{tx}" y="{ty}" fill="{color}" font-family="{font}" font-weight="{weight}" font-size="{size}" text-anchor="middle" letter-spacing="{ls}">{text}</text>"#,
                x = badge_left,
                y = layout.badge.y,
                w = badge_w,
                bg = Self::escape_xml(badge_fill),
                tx = badge_left + badge_w / 2.0,
                ty = layout.badge.y + 30.0,
                color = Self::escape_xml(&layout.badge.color),
                font = Self::escape_xml(&layout.badge.font_family),
                weight = Self::escape_xml(&layout.badge.font_weight),
                size = layout.badge.font_size,
                ls = layout.badge.letter_spacing,
                text = badge_text
            )
        } else {
            String::new()
        };

        let title_svg = if layout.title.visible {
            Self::render_multiline_text(&req.title, &layout.title, 1.22)
        } else {
            String::new()
        };

        let speaker_label_svg = if layout.speaker_label.visible {
            Self::render_multiline_text("BERSAMA PEMATERI:", &layout.speaker_label, 1.24)
        } else {
            String::new()
        };

        let speaker_svg = if layout.speaker.visible {
            Self::render_multiline_text(&req.speaker, &layout.speaker, 1.24)
        } else {
            String::new()
        };

        let cancel_svg = if req.status_type == "cancelled" && layout.cancellation_notice.visible {
            let reason = req
                .cancellation_reason
                .as_deref()
                .unwrap_or("Ustadz berhalangan hadir");
            let box_w = layout.cancellation_notice.max_width.clamp(360.0, 1000.0);
            let box_left = layout.cancellation_notice.x - box_w / 2.0;
            let lines = Self::wrap_text(
                &format!("PEMBERITAHUAN: {}", reason),
                box_w - 60.0,
                layout.cancellation_notice.font_size,
                layout.cancellation_notice.letter_spacing,
            );
            let line_h = (layout.cancellation_notice.font_size * 1.3).round();
            let box_h = (36.0 + (lines.len() as f64) * line_h).max(76.0);
            let bg = layout
                .cancellation_notice
                .background_color
                .as_deref()
                .unwrap_or("#fef2f2");
            let border = layout
                .cancellation_notice
                .border_color
                .as_deref()
                .unwrap_or("#f87171");
            let tspans: String = lines
                .iter()
                .enumerate()
                .map(|(i, l)| {
                    format!(
                        r#"<tspan x="{x}" dy="{dy}">{txt}</tspan>"#,
                        x = layout.cancellation_notice.x,
                        dy = if i == 0 { 0.0 } else { line_h },
                        txt = Self::escape_xml(l)
                    )
                })
                .collect();

            format!(
                r#"<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="16" fill="{bg}" stroke="{bd}" stroke-width="2"/>
                <text x="{tx}" y="{ty}" fill="{col}" font-family="{font}" font-weight="{wt}" font-size="{fs}" text-anchor="middle" letter-spacing="{ls}">{tspans}</text>"#,
                bx = box_left,
                by = layout.cancellation_notice.y,
                bw = box_w,
                bh = box_h,
                bg = Self::escape_xml(bg),
                bd = Self::escape_xml(border),
                tx = layout.cancellation_notice.x,
                ty = layout.cancellation_notice.y + 38.0,
                col = Self::escape_xml(&layout.cancellation_notice.color),
                font = Self::escape_xml(&layout.cancellation_notice.font_family),
                wt = Self::escape_xml(&layout.cancellation_notice.font_weight),
                fs = layout.cancellation_notice.font_size,
                ls = layout.cancellation_notice.letter_spacing,
                tspans = tspans
            )
        } else {
            String::new()
        };

        let details_svg = if layout.details_box.visible {
            let dl = &layout.details_box;
            let box_w = dl.max_width.clamp(360.0, 1000.0);
            let box_left = dl.x - box_w / 2.0;
            let text_x = match dl.align {
                PosterTextAlign::Center => dl.x,
                PosterTextAlign::Right => box_left + box_w - 36.0,
                PosterTextAlign::Left => box_left + 36.0,
            };
            let line_gap = (dl.font_size * 1.65).round();
            let loc_size = (dl.font_size - 2.0).max(16.0);
            let loc_lines = Self::wrap_text(
                &format!("Lokasi: {}", req.location),
                box_w - 72.0,
                loc_size,
                dl.letter_spacing,
            );
            let loc_line_h = (dl.font_size * 1.3).round();
            let box_h = (92.0 + line_gap + (loc_lines.len() as f64) * (dl.font_size * 1.32).round())
                .max(160.0);
            let bg = dl
                .background_color
                .as_deref()
                .unwrap_or("rgba(15, 23, 42, 0.78)");
            let border = dl.border_color.as_deref().unwrap_or("rgba(255,255,255,0.18)");
            let sub_color = if is_light { "#334155" } else { "#e2e8f0" };
            let loc_color = if is_light { "#0284c7" } else { "#93c5fd" };
            let loc_tspans: String = loc_lines
                .iter()
                .enumerate()
                .map(|(i, l)| {
                    format!(
                        r#"<tspan x="{x}" dy="{dy}">{txt}</tspan>"#,
                        x = text_x,
                        dy = if i == 0 { 0.0 } else { loc_line_h },
                        txt = Self::escape_xml(l)
                    )
                })
                .collect();

            format!(
                r#"<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="20" fill="{bg}" stroke="{bd}" stroke-width="1.5"/>
                <text x="{tx}" y="{y1}" fill="{c1}" font-family="{font}" font-weight="{wt}" font-size="{fs}" text-anchor="{anc}" letter-spacing="{ls}">Hari / Tanggal: {date}</text>
                <text x="{tx}" y="{y2}" fill="{c2}" font-family="{font}" font-weight="500" font-size="{fs2}" text-anchor="{anc}" letter-spacing="{ls}">Waktu: {time}</text>
                <text x="{tx}" y="{y3}" fill="{c3}" font-family="{font}" font-weight="700" font-size="{fs3}" text-anchor="{anc}" letter-spacing="{ls}">{loc}</text>"#,
                bx = box_left,
                by = dl.y,
                bw = box_w,
                bh = box_h,
                bg = Self::escape_xml(bg),
                bd = Self::escape_xml(border),
                tx = text_x,
                y1 = dl.y + 48.0,
                y2 = dl.y + 48.0 + line_gap,
                y3 = dl.y + 48.0 + line_gap * 2.0,
                c1 = Self::escape_xml(&dl.color),
                c2 = sub_color,
                c3 = loc_color,
                font = Self::escape_xml(&dl.font_family),
                wt = Self::escape_xml(&dl.font_weight),
                fs = dl.font_size,
                fs2 = (dl.font_size - 1.0).max(16.0),
                fs3 = loc_size,
                anc = dl.align.as_svg_anchor(),
                ls = dl.letter_spacing,
                date = Self::escape_xml(&req.date_text),
                time = Self::escape_xml(&req.time_text),
                loc = loc_tspans
            )
        } else {
            String::new()
        };

        let footer_text = req
            .footer_text
            .as_deref()
            .unwrap_or("DIBUAT DENGAN TARI (TATA ORGANISASI) — MULTI-TENANT SAAS");
        let footer_svg = if layout.footer.visible {
            Self::render_multiline_text(footer_text, &layout.footer, 1.24)
        } else {
            String::new()
        };

        let mut custom_blocks_svg = String::new();
        for block in req.custom_text_blocks.iter().filter(|b| b.visible) {
            let temp_layout = PosterElementLayout {
                x: block.x,
                y: block.y,
                font_family: block.font_family.clone(),
                font_size: block.font_size,
                font_weight: block.font_weight.clone(),
                color: block.color.clone(),
                align: block.align,
                letter_spacing: block.letter_spacing,
                max_width: block.max_width,
                visible: block.visible,
                background_color: None,
                border_color: None,
            };
            custom_blocks_svg.push_str(&Self::render_multiline_text(
                &block.text,
                &temp_layout,
                1.24,
            ));
        }

        format!(
            r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <linearGradient id="gradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#022c22"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="gradModern" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="gradMidnight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="gradSunset" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="50%" stop-color="#7c2d12"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
    <pattern id="islamicPattern" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 30,0 L 60,30 L 30,60 L 0,30 Z" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1.5"/>
      <circle cx="30" cy="30" r="10" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1.5"/>
    </pattern>
    {logo_clips}
  </defs>
  {bg_layer}
  {logos_svg}
  {basmalah_svg}
  {badge_svg}
  {title_svg}
  {speaker_label_svg}
  {speaker_svg}
  {cancel_svg}
  {details_svg}
  {footer_svg}
  {custom_blocks_svg}
</svg>"##
        )
    }
}
