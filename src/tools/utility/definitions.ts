import type { ToolDefinition } from "@/lib/tools/types";

export const UTILITY_TOOLS: ToolDefinition[] = [
  {
    slug: "qr-code-generator",
    category: "utility",
    name: "QR Code Generator",
    h1: "QR Code Generator",
    description:
      "Create QR codes for websites, text, email, phone numbers and Wi-Fi networks. Download a PNG or share it. Generated privately in your browser.",
    intro:
      "Make a QR code in seconds for a link, a message, an email, a phone number or your Wi-Fi password. Choose the size and error correction, then download a PNG. Nothing is uploaded.",
    keywords: [
      "qr",
      "qr code",
      "generator",
      "barcode",
      "wifi qr",
      "url qr",
      "scan",
      "png",
      "link to qr",
    ],
    popular: true,
    addedAt: "2026-10-05",
    related: ["json-formatter", "ats-resume-checker"],
    howItWorks: [
      "Pick what the QR code should contain: a website, text, email, phone number or Wi-Fi network.",
      "Fill in the details and choose the image size and error-correction level.",
      "Choose Generate QR code, check it with your phone camera, then download the PNG, copy the content or share it.",
    ],
    formula: {
      title: "What gets encoded",
      body: [
        "Website: the address is checked, https:// is added if missing, and only http and https links are accepted. Email uses a mailto: link, phone uses tel:, and Wi-Fi uses the standard WIFI:T:WPA;S:name;P:password;; format that phone cameras understand.",
        "Error correction lets a code stay readable when it is dirty or partly covered: Low restores about 7% of damaged data, Medium 15%, Quartile 25% and High 30%. Higher levels make the code denser, so keep it low for long content and raise it for printed codes that may get scuffed.",
        "Codes include a 4-module quiet zone around the edge, as the QR specification recommends, and are drawn in black on white for the best scan reliability.",
      ],
    },
    example: {
      title: "Worked example",
      body: [
        "Choose Website, enter example.com/menu and generate. The code encodes https://example.com/menu, which opens when scanned.",
        "For Wi-Fi, a network named Cafe with the WPA password abc12345 becomes WIFI:T:WPA;S:Cafe;P:abc12345;; and joining the network starts when the code is scanned on most phones.",
      ],
    },
    tips: [
      "Always scan the code with a phone before printing or publishing it.",
      "Print at least 2 cm (about 0.8 inch) wide, with good contrast and a blank border around it.",
      "Wi-Fi codes include the password in plain form, so only display them where you are happy for people to join.",
      "Use a short link for a simpler, easier-to-scan code.",
    ],
    limitations: [
      "Codes are static: the content is fixed inside the image and cannot be edited or tracked later.",
      "Custom colours and logos are not supported, because they can make codes harder to scan.",
      "Very long content cannot fit in a QR code. The tool tells you when this happens.",
    ],
    faqs: [
      {
        q: "Is the QR code generated on your server?",
        a: "No. It is generated in your browser, so the content you enter (including Wi-Fi passwords) is never sent to Toolora.",
      },
      {
        q: "Do the QR codes expire?",
        a: "No. They are static codes that simply contain your text or link, so they work as long as the link or information remains valid.",
      },
      {
        q: "What size should I download?",
        a: "512 × 512 px is fine for most screens. Choose 1024 × 1024 px for printing.",
      },
      {
        q: "Why won't my QR code scan?",
        a: "Check there is a blank border, the contrast is high, the code is large enough, and the content is not too long. Lower error correction makes a less dense, easier-to-scan code.",
      },
    ],
  },
];
