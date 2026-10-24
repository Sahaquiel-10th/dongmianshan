"use client";
import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from "react";
import { contentUrlError, normalizeContentUrl, type ContentUrlKind } from "@/lib/content-url";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
  kind?: ContentUrlKind;
};

export function UrlInput({ value, onValueChange, kind = "link", id, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const ref = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  const error = contentUrlError(value, kind);
  useEffect(() => { ref.current?.setCustomValidity(error ?? ""); }, [error]);
  return (
    <>
      <input
        {...props}
        ref={ref}
        id={inputId}
        type="text"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        aria-invalid={touched && !!error}
        aria-describedby={`${hintId}${touched && error ? ` ${errorId}` : ""}`}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={() => {
          setTouched(true);
          const normalized = normalizeContentUrl(value);
          if (!error && normalized !== value) onValueChange(normalized);
        }}
        onInvalid={() => {
          // A collapsed settings group must open before native validation
          // attempts to focus its invalid input.
          let parent = ref.current?.parentElement;
          while (parent) {
            if (parent instanceof HTMLDetailsElement) parent.open = true;
            parent = parent.parentElement;
          }
          setTouched(true);
        }}
      />
      <small className="cms-url-hint" id={hintId}>
        {kind === "image" ? "可粘贴图片网址；省略 https:// 会自动补齐。" : "可填域名（自动补齐 https://）、/chanpin 等站内路径，或 #products 等页内锚点。"}
      </small>
      {touched && error ? <small className="cms-url-error" id={errorId} role="alert">{error}</small> : null}
    </>
  );
}
