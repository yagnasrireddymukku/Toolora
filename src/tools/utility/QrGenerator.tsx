"use client";

import { useState } from "react";
import { CopyButton } from "@/components/tool/ActionButtons";
import { ResultPanel } from "@/components/tool/ResultPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import { DownloadIcon, ResetIcon, ShareIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";
import { Tabs } from "@/components/ui/Tabs";
import { dataUrlToBlob, downloadBlob, shareContent } from "@/lib/browser";
import {
  buildEmailPayload,
  buildPhonePayload,
  buildTextPayload,
  buildUrlPayload,
  buildWifiPayload,
  QR_SIZES,
  type QrErrorCorrection,
  type QrPayloadResult,
  type WifiSecurity,
} from "@/lib/qr";

interface Options {
  size: number;
  level: QrErrorCorrection;
}

/** Quiet-zone width in modules. 4 is the QR specification's recommendation for reliable scanning. */
const QUIET_ZONE = 4;

async function renderQr(payload: string, { size, level }: Options): Promise<string> {
  // Loaded on demand so the QR engine is only downloaded when someone generates a code.
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: level,
    width: size,
    margin: QUIET_ZONE,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

interface FormProps {
  kind: string;
  options: Options;
  /** Builds the payload from the current field values. */
  build: () => QrPayloadResult;
  onReset: () => void;
  children: React.ReactNode;
}

interface Generated {
  dataUrl: string;
  payload: string;
}

function QrForm({ kind, options, build, onReset, children }: FormProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [shareNote, setShareNote] = useState("");

  async function generate() {
    setShareNote("");
    const built = build();
    if (!built.ok) {
      setError(built.error);
      setGenerated(null);
      return;
    }
    setError("");
    setBusy(true);
    try {
      setGenerated({
        dataUrl: await renderQr(built.payload, options),
        payload: built.payload,
      });
    } catch {
      setGenerated(null);
      setError(
        "That content is too long to fit in a QR code at this error-correction level. Shorten it or choose a lower level.",
      );
    } finally {
      setBusy(false);
    }
  }

  const filename = `qr-code-${kind.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

  return (
    <div className="space-y-6">
      <Card>
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
        >
          {children}
          {error && (
            <Alert tone="error" title="Cannot generate the QR code">
              {error}
            </Alert>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={busy}>
              Generate QR code
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                onReset();
                setError("");
                setGenerated(null);
                setShareNote("");
              }}
            >
              <ResetIcon />
              Reset
            </Button>
            {busy && <Spinner label="Generating" />}
          </div>
        </form>
      </Card>

      {generated && (
        <ResultPanel
          title="Your QR code"
          actions={
            <>
              <Button
                variant="secondary"
                onClick={() => downloadBlob(filename, dataUrlToBlob(generated.dataUrl))}
              >
                <DownloadIcon />
                Download PNG
              </Button>
              <CopyButton text={generated.payload} label="Copy content" />
              <Button
                variant="secondary"
                onClick={async () => {
                  const file = new File([dataUrlToBlob(generated.dataUrl)], filename, {
                    type: "image/png",
                  });
                  const outcome = await shareContent({
                    title: "QR code",
                    text: kind === "Text" ? generated.payload : `QR code (${kind})`,
                    files: [file],
                  });
                  setShareNote(
                    outcome === "copied"
                      ? "Sharing is not available, so the QR content was copied instead."
                      : outcome === "failed"
                        ? "Could not share or copy. Please download the image instead."
                        : "",
                  );
                }}
              >
                <ShareIcon />
                Share
              </Button>
            </>
          }
        >
          <div className="flex justify-center rounded-lg bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generated.dataUrl}
              alt={`QR code containing: ${generated.payload.length > 120 ? `${generated.payload.slice(0, 117)}…` : generated.payload}`}
              width={options.size}
              height={options.size}
              className="h-auto max-w-full"
              style={{ imageRendering: "pixelated", maxWidth: "min(100%, 24rem)" }}
            />
          </div>
          <p className="text-ink-soft mt-3 text-sm">
            Encoded content:{" "}
            <span className="font-mono break-all">{generated.payload}</span>
          </p>
          <p className="text-ink-muted mt-1 text-sm">
            Test the code with your phone camera before printing it.
          </p>
          {shareNote && (
            <p role="status" className="text-ok-700 mt-2 text-sm font-medium">
              {shareNote}
            </p>
          )}
        </ResultPanel>
      )}
    </div>
  );
}

function UrlForm({ options }: { options: Options }) {
  const [url, setUrl] = useState("");
  return (
    <QrForm
      kind="URL"
      options={options}
      build={() => buildUrlPayload(url)}
      onReset={() => setUrl("")}
    >
      <TextField
        label="Website address"
        type="url"
        inputMode="url"
        autoComplete="off"
        value={url}
        placeholder="https://example.com"
        onChange={(e) => setUrl(e.target.value)}
      />
    </QrForm>
  );
}

function TextForm({ options }: { options: Options }) {
  const [text, setText] = useState("");
  return (
    <QrForm
      kind="Text"
      options={options}
      build={() => buildTextPayload(text)}
      onReset={() => setText("")}
    >
      <TextAreaField
        label="Text"
        rows={4}
        value={text}
        maxLength={1000}
        onChange={(e) => setText(e.target.value)}
        hint="Up to 1,000 characters."
      />
    </QrForm>
  );
}

function EmailForm({ options }: { options: Options }) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  return (
    <QrForm
      kind="Email"
      options={options}
      build={() => buildEmailPayload(email, subject, body)}
      onReset={() => {
        setEmail("");
        setSubject("");
        setBody("");
      }}
    >
      <TextField
        label="Email address"
        type="email"
        autoComplete="off"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Subject (optional)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <TextAreaField
        label="Message (optional)"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
    </QrForm>
  );
}

function PhoneForm({ options }: { options: Options }) {
  const [phone, setPhone] = useState("");
  return (
    <QrForm
      kind="Phone"
      options={options}
      build={() => buildPhonePayload(phone)}
      onReset={() => setPhone("")}
    >
      <TextField
        label="Phone number"
        type="tel"
        inputMode="tel"
        autoComplete="off"
        value={phone}
        hint="Include the country code, for example +91 98765 43210."
        onChange={(e) => setPhone(e.target.value)}
      />
    </QrForm>
  );
}

function WifiForm({ options }: { options: Options }) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<WifiSecurity>("WPA");
  const [hidden, setHidden] = useState(false);
  return (
    <QrForm
      kind="Wi-Fi"
      options={options}
      build={() => buildWifiPayload(ssid, password, security, hidden)}
      onReset={() => {
        setSsid("");
        setPassword("");
        setSecurity("WPA");
        setHidden(false);
      }}
    >
      <TextField
        label="Network name (SSID)"
        autoComplete="off"
        value={ssid}
        maxLength={32}
        onChange={(e) => setSsid(e.target.value)}
      />
      <SelectField
        label="Security"
        value={security}
        onChange={(e) => setSecurity(e.target.value as WifiSecurity)}
      >
        <option value="WPA">WPA / WPA2 / WPA3</option>
        <option value="WEP">WEP</option>
        <option value="nopass">No password</option>
      </SelectField>
      {security !== "nopass" && (
        <TextField
          label="Password"
          type="text"
          autoComplete="off"
          value={password}
          maxLength={63}
          onChange={(e) => setPassword(e.target.value)}
          hint="Anyone who scans the code can see the password."
        />
      )}
      <CheckboxField
        label="Hidden network"
        checked={hidden}
        onChange={(e) => setHidden(e.target.checked)}
      />
    </QrForm>
  );
}

export function QrGenerator() {
  const [size, setSize] = useState<number>(512);
  const [level, setLevel] = useState<QrErrorCorrection>("M");
  const options: Options = { size, level };

  return (
    <div className="space-y-6">
      <Alert tone="info" title="Private by design">
        QR codes are generated in your browser. The content you enter is never sent to a
        server.
      </Alert>
      <Card>
        <h2 className="mb-3 text-base font-semibold">Image settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Image size"
            value={String(size)}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {QR_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} × {s} px
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Error correction"
            value={level}
            onChange={(e) => setLevel(e.target.value as QrErrorCorrection)}
            hint="Higher levels survive damage better but make a denser code."
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </SelectField>
        </div>
        <p className="text-ink-muted mt-3 text-sm">
          Settings apply the next time you choose Generate QR code.
        </p>
      </Card>
      <Tabs
        label="QR code content type"
        items={[
          { id: "url", label: "Website", content: <UrlForm options={options} /> },
          { id: "text", label: "Text", content: <TextForm options={options} /> },
          { id: "email", label: "Email", content: <EmailForm options={options} /> },
          { id: "phone", label: "Phone", content: <PhoneForm options={options} /> },
          { id: "wifi", label: "Wi-Fi", content: <WifiForm options={options} /> },
        ]}
      />
    </div>
  );
}
