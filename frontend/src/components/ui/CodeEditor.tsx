/* eslint-disable @typescript-eslint/no-explicit-any */
import { CODE_SNIPPETS, type Language } from "@/lib/constants";
import { Editor } from "@monaco-editor/react";

export default function CodeEditor({
  language,
  onMount,
  value,
  setValue,
  readOnly = false,
}: {
  language: Language;
  onMount: (editor: any) => void;
  value: string | undefined;
  setValue: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="h-[600px] lg:h-full w-full">
      <Editor
        theme="vs-dark"
        height="100%"
        width="100%"
        language={language}
        defaultValue={CODE_SNIPPETS[language]}
        onMount={onMount}
        value={value}
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          lineNumbers: "off",
          wordWrap: "on",
        }}
        onChange={value => setValue(value ?? "")}
      />
    </div>
  );
}
