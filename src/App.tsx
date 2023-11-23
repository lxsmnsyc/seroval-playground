import type { JSX } from 'solid-js';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { crossSerializeStream, deserialize, getCrossReferenceHeader } from 'seroval';
import example from './example.js?raw';

export default function App(): JSX.Element {
  const input = $signal<HTMLElement>();
  const output = $signal<HTMLElement>();

  $effect(() => {
    if (input && output) {
      const inputView = new EditorView({
        doc: example,
        extensions: [
          basicSetup,
          javascript(),
        ],
        parent: input,
      });
      const outputView = new EditorView({
        extensions: [
          basicSetup,
          javascript(),
        ],
        parent: output,
      });

      const clear = (): void => {
        // Create a transaction to modify the document
        const transaction = outputView.state.update({
          changes: {
            from: 0,
            to: outputView.state.doc.length, // line number
            insert: '', // text to insert
          },
        });

        outputView.dispatch(transaction);
      };

      const insertLine = (lineNumber: number, text: string): void => {
        // Create a transaction to modify the document
        const transaction = outputView.state.update({
          changes: {
            from: outputView.state.doc.line(lineNumber).from,
            to: outputView.state.doc.line(lineNumber).to, // line number
            insert: `${text}\n`, // text to insert
          },
        });

        outputView.dispatch(transaction);
      };

      let prev: (() => void) | undefined;

      const process = (): void => {
        let line = 1;
        clear();
        if (prev) {
          prev();
        }
        prev = crossSerializeStream(deserialize(inputView.state.doc.toString()), {
          onSerialize(data, initial) {
            if (initial) {
              insertLine(line++, getCrossReferenceHeader());
            }
            insertLine(line++, `${data};`);
          },
        });
      };

      $effect(() => {
        process();

        let timeout: number | undefined;
        inputView.dom.addEventListener('input', () => {
          if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
          }
          timeout = setTimeout(() => {
            process();
            timeout = undefined;
          }, 250);
        });
      });

      $cleanup(() => {
        inputView.destroy();
        outputView.destroy();
      });
    }
  });

  return (
    <div class="flex flex-col gap-4 m-8">
      <h1 class="text-4xl font-bold">Seroval</h1>
      <div class="w-full h-screen flex flex-row rounded-lg shadow-lg overflow-hidden">
        <div class="flex-1 overflow-auto" ref={$set(input)}></div>
        <div class="flex-1 overflow-auto" ref={$set(output)}></div>
      </div>
    </div>
  );
}
