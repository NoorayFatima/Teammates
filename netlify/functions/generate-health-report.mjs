import PDFDocument from "pdfkit";

const BRAND = {
    navy: "#054DA2",
    navyInk: "#041B40",
    orange: "#F68121",
    cyan: "#01C0F4",
    green: "#1E8F5E",
    amber: "#C98A1F",
    rust: "#B23B3B",
    ink: "#131A24",
    soft: "#59667A",
    paper: "#FFFFFF",
    sand: "#F3F6FB",
    line: "#E1E7F0",
    white: "#FFFFFF"
};

const PAGE = {
    width: 595.28,
    height: 841.89,
    left: 50,
    right: 545,
    footer: 785
};

const MAX_SCORE = 20;
const QUESTION_COUNT = 10;

function cleanText(value, fallback = "Not provided") {
    if (value === undefined || value === null || String(value).trim() === "") {
        return fallback;
    }

    return String(value)
        .trim()
        .replace(/[—–]/g, "-");
}

function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function formatDate(value) {
    if (!value) {
        return new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return cleanText(value);
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

function bandFromScore(total) {
    if (total >= 16) {
        return {
            title: "16 to 20: Solid foundation",
            heading: "Most HR basics are in place.",
            text:
                "Your foundations look sound. Close the remaining gaps before growth turns them into bottlenecks.",
            color: BRAND.green
        };
    }

    if (total >= 10) {
        return {
            title: "10 to 15: Needs strengthening",
            heading: "Several practices need strengthening.",
            text:
                "The basics exist but are uneven. Prioritise the areas where you answered Partly or No.",
            color: BRAND.amber
        };
    }

    return {
        title: "0 to 9: Start with the essentials",
        heading: "Start with the essentials.",
        text:
            "Begin by establishing clear HR responsibility and the core processes, then build steadily from there.",
        color: BRAND.rust
    };
}

function answerStatus(score) {
    const value = safeNumber(score);

    if (value === 2) {
        return {
            label: "Yes",
            assessment: "In place",
            color: BRAND.green,
            fill: "#F0F8F4"
        };
    }

    if (value === 1) {
        return {
            label: "Partly",
            assessment: "Needs attention",
            color: BRAND.amber,
            fill: "#FFF8EA"
        };
    }

    return {
        label: "No / Unsure",
        assessment: "Gap or unclear",
        color: BRAND.rust,
        fill: "#FFF1F1"
    };
}

function setFont(doc, font, size, color) {
    doc
        .font(font)
        .fontSize(size)
        .fillColor(color);
}

function drawBrandHeader(doc, section) {
    doc
        .roundedRect(50, 30, 8, 24, 2)
        .fillColor(BRAND.orange)
        .fill();

    setFont(doc, "Helvetica-Bold", 10, BRAND.navyInk);

    doc.text("TEAM MATES", 67, 33);

    setFont(doc, "Helvetica", 7.5, BRAND.soft);

    doc.text(section.toUpperCase(), 390, 36, {
        width: 155,
        align: "right"
    });

    doc
        .moveTo(50, 66)
        .lineTo(545, 66)
        .lineWidth(0.8)
        .strokeColor(BRAND.line)
        .stroke();

    doc
        .moveTo(50, 67)
        .lineTo(125, 67)
        .lineWidth(2)
        .strokeColor(BRAND.orange)
        .stroke();
}

function drawFooter(doc, pageNumber) {
    doc
        .moveTo(50, 774)
        .lineTo(545, 774)
        .lineWidth(0.7)
        .strokeColor(BRAND.line)
        .stroke();

    setFont(doc, "Helvetica", 7.2, BRAND.soft);

    doc.text(
        "Team Mates | HR Consultancy & Advisory | info@teammates.com.pk",
        50,
        785,
        {
            width: 390
        }
    );

    doc.text(`Page ${pageNumber} of 5`, 470, 785, {
        width: 75,
        align: "right"
    });
}

function drawSectionTitle(doc, title, subtitle = "") {
    setFont(doc, "Helvetica-Bold", 21, BRAND.navyInk);

    doc.text(title, 50, 88, {
        width: 495
    });

    if (subtitle) {
        setFont(doc, "Helvetica", 9.2, BRAND.soft);

        doc.text(cleanText(subtitle), 50, 120, {
            width: 495,
            lineGap: 2
        });
    }
}

function drawLabelValue(doc, label, value, x, y, width = 250) {
    const safeLabel = String(label ?? '');
    const safeValue = String(value ?? 'Not provided');

    setFont(doc, "Helvetica-Bold", 8.5, BRAND.soft);

    doc.text(
        safeLabel.toUpperCase(),
        Number(x),
        Number(y),
        {
            width: Number(width),
            height: 12,
            lineBreak: false
        }
    );

    setFont(doc, "Helvetica-Bold", 11, BRAND.ink);

    doc.text(
        safeValue,
        Number(x),
        Number(y) + 14,
        {
            width: Number(width),
            height: 28,
            lineGap: 2,
            ellipsis: true
        }
    );
}

function drawRoundedCard(
    doc,
    x,
    y,
    width,
    height,
    fill = BRAND.paper
) {
    doc
        .roundedRect(x, y, width, height, 9)
        .fillColor(fill)
        .fill();

    doc
        .roundedRect(x, y, width, height, 9)
        .lineWidth(0.75)
        .strokeColor(BRAND.line)
        .stroke();
}

function drawDomainBar(doc, domain, x, y, width) {
    const got = safeNumber(domain.got);

    const max = Math.max(
        1,
        safeNumber(domain.max)
    );

    const percentage = Math.max(
        0,
        Math.min(
            100,
            Math.round((got / max) * 100)
        )
    );

    setFont(
        doc,
        "Helvetica-Bold",
        8.7,
        BRAND.ink
    );

    doc.text(
        cleanText(domain.name),
        x,
        y,
        {
            width: width - 90
        }
    );

    setFont(
        doc,
        "Helvetica",
        8,
        BRAND.soft
    );

    doc.text(
        `${got}/${max}  |  ${percentage}%`,
        x + width - 82,
        y,
        {
            width: 82,
            align: "right"
        }
    );

    doc
        .roundedRect(
            x,
            y + 16,
            width,
            7,
            3.5
        )
        .fillColor("#E8EDF4")
        .fill();

    if (percentage > 0) {
        const fillWidth = Math.max(
            4,
            width * percentage / 100
        );

        doc
            .roundedRect(
                x,
                y + 16,
                fillWidth,
                7,
                3.5
            )
            .fillColor(
                percentage >= 75
                    ? BRAND.green
                    : percentage >= 50
                        ? BRAND.amber
                        : BRAND.rust
            )
            .fill();
    }
}

function drawQuestionCard(
    doc,
    detail,
    x,
    y,
    width,
    height
) {
    const status = answerStatus(
        detail.score
    );

    drawRoundedCard(
        doc,
        x,
        y,
        width,
        height
    );

    doc
        .roundedRect(
            x,
            y,
            5,
            height,
            2
        )
        .fillColor(status.color)
        .fill();

    setFont(
        doc,
        "Helvetica-Bold",
        8,
        BRAND.navy
    );

    doc.text(
        `Q${safeNumber(detail.n)}`,
        x + 16,
        y + 13
    );

    setFont(
        doc,
        "Helvetica-Bold",
        10.2,
        BRAND.navyInk
    );

    doc.text(
        cleanText(
            detail.short,
            `Question ${detail.n}`
        ),
        x + 48,
        y + 12,
        {
            width: width - 165
        }
    );

    doc
        .roundedRect(
            x + width - 112,
            y + 10,
            96,
            22,
            11
        )
        .fillColor(status.fill)
        .fill();

    setFont(
        doc,
        "Helvetica-Bold",
        7.8,
        status.color
    );

    doc.text(
        status.label,
        x + width - 104,
        y + 17,
        {
            width: 80,
            align: "center"
        }
    );

    setFont(
        doc,
        "Helvetica",
        8.5,
        BRAND.soft
    );

    doc.text(
        cleanText(detail.question),
        x + 16,
        y + 43,
        {
            width: width - 32,
            height: 34,
            lineGap: 2
        }
    );

    setFont(
        doc,
        "Helvetica-Bold",
        8,
        status.color
    );

    doc.text(
        status.assessment,
        x + 16,
        y + height - 20
    );
}

function drawPriorityCard(
    doc,
    item,
    action,
    priority,
    x,
    y,
    width
) {
    const status = answerStatus(
        item.score
    );

    drawRoundedCard(
        doc,
        x,
        y,
        width,
        82
    );

    doc
        .roundedRect(
            x,
            y,
            6,
            82,
            3
        )
        .fillColor(status.color)
        .fill();

    setFont(
        doc,
        "Helvetica-Bold",
        7.5,
        status.color
    );

    doc.text(
        `PRIORITY ${priority}`,
        x + 18,
        y + 12
    );

    setFont(
        doc,
        "Helvetica-Bold",
        10.2,
        BRAND.navyInk
    );

    doc.text(
        cleanText(item.short),
        x + 18,
        y + 28,
        {
            width: 285
        }
    );

    setFont(
        doc,
        "Helvetica-Bold",
        7.8,
        status.color
    );

    doc.text(
        `${status.label}  |  ${safeNumber(
            item.score
        )}/2`,
        x + 355,
        y + 13,
        {
            width: 120,
            align: "right"
        }
    );

    setFont(
        doc,
        "Helvetica",
        8.3,
        BRAND.soft
    );

    doc.text(
        cleanText(
            action,
            "Review and strengthen this area through clear ownership, documentation and regular review."
        ),
        x + 18,
        y + 49,
        {
            width: width - 36,
            height: 26,
            lineGap: 2
        }
    );
}

function drawCallout(
    doc,
    title,
    text,
    x,
    y,
    width,
    height,
    color = BRAND.navy
) {
    doc
        .roundedRect(
            x,
            y,
            width,
            height,
            9
        )
        .fillColor("#F4F7FB")
        .fill();

    doc
        .roundedRect(
            x,
            y,
            5,
            height,
            2
        )
        .fillColor(color)
        .fill();

    setFont(
        doc,
        "Helvetica-Bold",
        9,
        BRAND.navyInk
    );

    doc.text(
        title,
        x + 18,
        y + 13,
        {
            width: width - 36
        }
    );

    setFont(
        doc,
        "Helvetica",
        8.5,
        BRAND.soft
    );

    doc.text(
        cleanText(text),
        x + 18,
        y + 32,
        {
            width: width - 36,
            height: height - 40,
            lineGap: 3
        }
    );
}

export default async function handler(
    req,
    context
) {
    try {
        if (req.method !== "POST") {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "POST request required."
                }),
                {
                    status: 405,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        let data;

        try {
            data = await req.json();
        } catch (error) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "Invalid JSON request body."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        const company = cleanText(
            data.company
        );

        const nature = cleanText(
            data.nature
        );

        const email = cleanText(
            data.email
        );

        const contact = cleanText(
            data.contact
        );

        const phone = cleanText(
            data.phone
        );

        const headcount = cleanText(
            data.headcount
        );

        const challenge = cleanText(
            data.challenge,
            "No additional challenge was provided."
        );

        const diagnostic = cleanText(
            data.diagnostic,
            "No preference was provided."
        );

        const total = Math.max(
            0,
            Math.min(
                MAX_SCORE,
                safeNumber(data.total)
            )
        );

        const percentage = Math.max(
            0,
            Math.min(
                100,
                Number.isFinite(
                    Number(data.percentage)
                )
                    ? Number(data.percentage)
                    : Math.round(
                        (total / MAX_SCORE) * 100
                    )
            )
        );

        const details = Array.isArray(
            data.details
        )
            ? data.details.slice(
                0,
                QUESTION_COUNT
            )
            : [];

        const domains = Array.isArray(
            data.domains
        )
            ? data.domains.slice(0, 5)
            : [];

        const actions = Array.isArray(
            data.actions
        )
            ? data.actions
            : [];

        if (
            !company ||
            !nature ||
            !email
        ) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "Organisation name, nature of business and email are required."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        if (
            details.length !==
            QUESTION_COUNT
        ) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "The report requires all 10 Health Check questions."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }

        const band =
            bandFromScore(total);

        const doc =
            new PDFDocument({
                size: "A4",
                margin: 0,
                autoFirstPage: true,

                info: {
                    Title:
                        "Team Mates HR Health Check Report",

                    Author:
                        "Team Mates",

                    Subject:
                        `HR Health Check Report for ${company}`,

                    Keywords:
                        "Team Mates, HR, Health Check, HR Consultancy"
                }
            });

        const chunks = [];

        doc.on(
            "data",
            (chunk) => {
                chunks.push(chunk);
            }
        );

        const pdfBufferPromise =
            new Promise(
                (resolve, reject) => {
                    doc.on(
                        "end",
                        () =>
                            resolve(
                                Buffer.concat(
                                    chunks
                                )
                            )
                    );

                    doc.on(
                        "error",
                        reject
                    );
                }
            );

        /*
         * =========================================================
         * PAGE 1
         * EXECUTIVE SUMMARY
         * =========================================================
         */

        drawBrandHeader(
            doc,
            "HR Health Check Report"
        );

        setFont(
            doc,
            "Helvetica-Bold",
            8.5,
            BRAND.orange
        );

        doc.text(
            "HR CONSULTANCY & ADVISORY",
            50,
            88
        );

        setFont(
            doc,
            "Helvetica-Bold",
            27,
            BRAND.navyInk
        );

        doc.text(
            "HR Health Check Report",
            50,
            111
        );

        setFont(
            doc,
            "Helvetica",
            10,
            BRAND.soft
        );

        doc.text(
            "A practical snapshot of the organisation's current HR foundations.",
            50,
            148,
            {
                width: 495
            }
        );

        /*
         * Score panel
         */

        doc
            .roundedRect(
                50,
                188,
                205,
                125,
                12
            )
            .fillColor(
                BRAND.navyInk
            )
            .fill();

        setFont(
            doc,
            "Helvetica-Bold",
            34,
            BRAND.white
        );

        doc.text(
            `${total}/${MAX_SCORE}`,
            68,
            207
        );

        setFont(
            doc,
            "Helvetica",
            10,
            "#DCEBFF"
        );

        doc.text(
            `${percentage}% overall score`,
            70,
            252
        );

        setFont(
            doc,
            "Helvetica-Bold",
            9.2,
            BRAND.orange
        );

        doc.text(
            band.title,
            70,
            276,
            {
                width: 170
            }
        );

        /*
         * Organisation profile
         */

        doc
            .roundedRect(275, 188, 270, 125, 9)
            .fillColor(BRAND.paper)
            .fill();

        setFont(
            doc,
            "Helvetica-Bold",
            11,
            BRAND.navyInk
        );

        doc.text(
            "Organisation profile",
            293,
            207
        );

        drawLabelValue(
            doc,
            "Organisation",
            company,
            293,
            233,
            235
        );

        drawLabelValue(
            doc,
            "Nature of business",
            nature,
            293,
            274,
            235
        );

        setFont(
            doc,
            "Helvetica-Bold",
            7.3,
            BRAND.soft
        );

        doc.text(
            "ASSESSMENT DATE",
            293,
            303
        );

        setFont(
            doc,
            "Helvetica",
            8.8,
            BRAND.ink
        );

        doc.text(
            formatDate(
                data.assessmentDate
            ),
            390,
            303,
            {
                width: 135,
                align: "right"
            }
        );

        setFont(
            doc,
            "Helvetica-Bold",
            7.3,
            BRAND.soft
        );

        doc.text(
            "EMPLOYEES",
            293,
            318
        );

        setFont(
            doc,
            "Helvetica",
            8.8,
            BRAND.ink
        );

        doc.text(
            headcount,
            390,
            318,
            {
                width: 135,
                align: "right"
            }
        );

        /*
         * Interpretation
         */

        setFont(
            doc,
            "Helvetica-Bold",
            12,
            BRAND.navyInk
        );

        doc.text(
            "Overall interpretation",
            50,
            345
        );

        setFont(
            doc,
            "Helvetica-Bold",
            11.2,
            BRAND.ink
        );

        doc.text(
            band.heading,
            50,
            371,
            {
                width: 495
            }
        );

        setFont(
            doc,
            "Helvetica",
            9.2,
            BRAND.soft
        );

        doc.text(
            band.text,
            50,
            394,
            {
                width: 495,
                height: 38,
                lineGap: 3
            }
        );

        /*
         * Domains
         */

        setFont(
            doc,
            "Helvetica-Bold",
            12,
            BRAND.navyInk
        );

        doc.text(
            "Five HR domains",
            50,
            452
        );

        let domainY = 480;

        for (
            const domain of domains
        ) {
            drawDomainBar(
                doc,
                domain,
                50,
                domainY,
                495
            );

            domainY += 42;
        }

        drawCallout(
            doc,
            "Assessment basis",
            "This report is based on an indicative self-check and is not a verified audit. Serious concerns should be addressed regardless of the overall score.",
            50,
            700,
            495,
            55,
            BRAND.cyan
        );

        drawFooter(doc, 1);

        /*
         * =========================================================
         * PAGE 2
         * QUESTIONS 1 TO 5
         * =========================================================
         */

        doc.addPage();

        drawBrandHeader(
            doc,
            "Detailed Assessment"
        );

        drawSectionTitle(
            doc,
            "Detailed assessment",
            "Questions 1 to 5. Each response is shown with its current assessment status."
        );

        let questionY = 153;

        for (
            const detail of details.slice(
                0,
                5
            )
        ) {
            drawQuestionCard(
                doc,
                detail,
                50,
                questionY,
                495,
                108
            );

            questionY += 119;
        }

        drawFooter(doc, 2);

        /*
         * =========================================================
         * PAGE 3
         * QUESTIONS 6 TO 10
         * =========================================================
         */

        doc.addPage();

        drawBrandHeader(
            doc,
            "Detailed Assessment"
        );

        drawSectionTitle(
            doc,
            "Detailed assessment",
            "Questions 6 to 10. Use these responses to identify practical areas for improvement."
        );

        questionY = 153;

        for (
            const detail of details.slice(
                5,
                10
            )
        ) {
            drawQuestionCard(
                doc,
                detail,
                50,
                questionY,
                495,
                108
            );

            questionY += 119;
        }

        drawFooter(doc, 3);

        /*
         * =========================================================
         * PAGE 4
         * PRIORITY AREAS
         * =========================================================
         */

        doc.addPage();

        drawBrandHeader(
            doc,
            "Priority Areas"
        );

        drawSectionTitle(
            doc,
            "Priority areas",
            "The areas below are drawn from the lowest-scoring responses in this Health Check."
        );

        const weak =
            details
                .filter(
                    (item) =>
                        safeNumber(
                            item.score
                        ) < 2
                )
                .sort(
                    (a, b) => {
                        const scoreDifference =
                            safeNumber(
                                a.score
                            ) -
                            safeNumber(
                                b.score
                            );

                        if (
                            scoreDifference !==
                            0
                        ) {
                            return scoreDifference;
                        }

                        return (
                            safeNumber(
                                a.n
                            ) -
                            safeNumber(
                                b.n
                            )
                        );
                    }
                )
                .slice(0, 6);

        if (
            weak.length === 0
        ) {
            drawCallout(
                doc,
                "No immediate priority gaps identified",
                "All ten questions were marked Yes. Maintain the current practices and review them periodically as the organisation grows.",
                50,
                160,
                495,
                95,
                BRAND.green
            );
        } else {
            let priorityY = 153;

            weak.forEach(
                (item, index) => {
                    const matchingAction =
                        actions.find(
                            (candidate) =>
                                safeNumber(
                                    candidate.n
                                ) ===
                                safeNumber(
                                    item.n
                                )
                        );

                    drawPriorityCard(
                        doc,
                        item,
                        matchingAction
                            ?.action,
                        index + 1,
                        50,
                        priorityY,
                        495
                    );

                    priorityY += 91;
                }
            );
        }

        drawCallout(
            doc,
            "How to use these priorities",
            "Start with areas scored No or Unsure. Then address Partly responses through clearer ownership, documentation, measurement or regular review.",
            50,
            700,
            495,
            55,
            BRAND.orange
        );

        drawFooter(doc, 4);

        /*
         * =========================================================
         * PAGE 5
         * CONTEXT AND NEXT STEPS
         * =========================================================
         */

        doc.addPage();

        drawBrandHeader(
            doc,
            "Context & Next Steps"
        );

        drawSectionTitle(
            doc,
            "Organisation context and next steps",
            "Additional information supplied with the Health Check."
        );

        setFont(
            doc,
            "Helvetica-Bold",
            12,
            BRAND.navyInk
        );

        doc.text(
            "Biggest people-related challenge",
            50,
            160
        );

        drawRoundedCard(
            doc,
            50,
            187,
            495,
            105,
            BRAND.sand
        );

        setFont(
            doc,
            "Helvetica",
            9.2,
            BRAND.ink
        );

        doc.text(
            challenge,
            70,
            211,
            {
                width: 455,
                height: 65,
                lineGap: 4
            }
        );

        setFont(
            doc,
            "Helvetica-Bold",
            12,
            BRAND.navyInk
        );

        doc.text(
            "Diagnostic discussion",
            50,
            325
        );

        drawRoundedCard(
            doc,
            50,
            352,
            495,
            68
        );

        setFont(
            doc,
            "Helvetica-Bold",
            10,
            BRAND.ink
        );

        doc.text(
            diagnostic,
            70,
            377,
            {
                width: 455
            }
        );

        setFont(
            doc,
            "Helvetica-Bold",
            12,
            BRAND.navyInk
        );

        doc.text(
            "Recommended next steps",
            50,
            456
        );

        const nextSteps = [
            "Review the lowest-scoring areas with the person responsible for HR.",
            "Select two or three priorities that can be improved within the next 30 to 90 days.",
            "Assign an owner and a practical measure of progress for each priority.",
            "Document the agreed actions and review progress regularly.",
            "Consider a focused Team Mates consultation where specialist support is required."
        ];

        let stepY = 486;

        nextSteps.forEach(
            (step, index) => {
                doc
                    .circle(
                        59,
                        stepY + 5,
                        4
                    )
                    .fillColor(
                        BRAND.orange
                    )
                    .fill();

                setFont(
                    doc,
                    "Helvetica-Bold",
                    8,
                    BRAND.navy
                );

                doc.text(
                    `${index + 1}`,
                    56,
                    stepY + 2,
                    {
                        width: 6,
                        align: "center"
                    }
                );

                setFont(
                    doc,
                    "Helvetica",
                    9,
                    BRAND.ink
                );

                doc.text(
                    step,
                    75,
                    stepY,
                    {
                        width: 465,
                        height: 28,
                        lineGap: 3
                    }
                );

                stepY += 39;
            }
        );

        doc
            .roundedRect(
                50,
                690,
                495,
                57,
                9
            )
            .fillColor(
                BRAND.navyInk
            )
            .fill();

        setFont(
            doc,
            "Helvetica-Bold",
            10,
            BRAND.white
        );

        doc.text(
            "Team Mates | HR Consultancy & Advisory",
            68,
            706
        );

        setFont(
            doc,
            "Helvetica",
            7.7,
            "#DCEBFF"
        );

        doc.text(
            "Strategic HR & OD  |  Talent & Performance  |  HR Operations  |  Financial Consultancy",
            68,
            725,
            {
                width: 455
            }
        );

        drawFooter(doc, 5);

        /*
         * Finish PDF
         */


        doc.end();

        const pdfBuffer = await pdfBufferPromise;

        const safeCompany =
            company
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") || "organisation";

        const filename =
            `team-mates-hr-health-check-${safeCompany}.pdf`;

        /* ---------- Send PDF through Postmark ---------- */

        const postmarkToken =
            process.env.POSTMARK_SERVER_TOKEN;

        if (!postmarkToken) {
            throw new Error(
                "POSTMARK_SERVER_TOKEN is not configured."
            );
        }

        const pdfBase64 =
            pdfBuffer.toString("base64");

        const recipientName =
            company || "Team Mates Client";

        const postmarkResponse = await fetch(
            "https://api.postmarkapp.com/email",
            {
                method: "POST",

                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Postmark-Server-Token":
                        postmarkToken
                },

                body: JSON.stringify({
                    From:
                        "Team Mates <info@teammates.com.pk>",

                    To: "info@teammates.com.pk",

                    ReplyTo: email,

                    Subject:
                        "New Team Mates HR Health Check Report",
                    MessageStream:
                        "outbound",

                    TextBody:
                        `A new HR Health Check has been completed.

Organisation:
${company}

Nature of business:
${nature}

Overall score:
${total}/20 (${percentage}%)

The full HR Health Check report is attached as a PDF.

Submitted email:
${email}

Contact:
${contact || "Not provided"}

Phone:
${phone || "Not provided"}

Employees:
${headcount || "Not provided"}

Regards,
Team Mates
HR Consultancy & Advisory
`,

                    Attachments: [
                        {
                            Name: filename,
                            Content: pdfBase64,
                            ContentType: "application/pdf"
                        }
                    ]
                })
            }
        );

        if (!postmarkResponse.ok) {
            let postmarkError = "";

            try {
                const errorData =
                    await postmarkResponse.json();

                postmarkError =
                    errorData.Message ||
                    errorData.ErrorCode ||
                    "";
            } catch (ignore) {
                /* Ignore JSON parsing failure */
            }

            throw new Error(
                postmarkError ||
                "Postmark failed to send the HR Health Check email."
            );
        }

        /* ---------- Successful response ---------- */

        return new Response(
            JSON.stringify({
                success: true,
                message:
                    "HR Health Check report emailed successfully."
            }),
            {
                status: 200,
                headers: {
                    "Content-Type":
                        "application/json",
                    "Cache-Control":
                        "no-store"
                }
            }
        );
    } catch (error) {
        console.error(
            "HR Health Report PDF error:",
            error
        );

        return new Response(
            JSON.stringify({
                success: false,
                error:
                    "PDF generation failed.",

                details:
                    process.env.NETLIFY_DEV ===
                        "true"
                        ? String(
                            error?.message ||
                            error
                        )
                        : undefined
            }),
            {
                status: 500,

                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );
    }
}