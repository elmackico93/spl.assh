import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

export interface TerminalProps {
  title?: string;
  prompt?: string;
  commands?: Record<string, (args: string[]) => string>;
  initialCommands?: string[];
  className?: string;
  height?: string;
  allowUserInput?: boolean;
  readOnly?: boolean;
  showHeader?: boolean;
  autoFocus?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  title = 'Matrix Terminal',
  prompt = '>',
  commands = {},
  initialCommands = [],
  className,
  height = '400px',
  allowUserInput = true,
  readOnly = false,
  showHeader = true,
  autoFocus = false,
}) => {
  const [output, setOutput] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const defaultCommands = {
    help: () =>
      'Available commands: ' +
      Object.keys({
        ...defaultCommands,
        ...commands,
      }).join(', '),
    clear: () => {
      setOutput([]);
      return '';
    },
    echo: (args: string[]) => args.join(' '),
    date: () => new Date().toLocaleString(),
  };

  const allCommands = {
    ...defaultCommands,
    ...commands,
  };

  useEffect(() => {
    // Execute initial commands
    initialCommands.forEach((cmd) => executeCommand(cmd));
  }, []);

  useEffect(() => {
    // Scroll to bottom on new output
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = (input: string) => {
    // Add command to output
    setOutput((prev) => [...prev, `${prompt} ${input}`]);

    // Process command
    const args = input.trim().split(' ');
    const command = args[0].toLowerCase();
    const commandArgs = args.slice(1);

    if (command === '') {
      // Do nothing for empty command
    } else if (command in allCommands) {
      try {
        const result = allCommands[command](commandArgs);
        if (result) {
          setOutput((prev) => [...prev, result]);
        }
      } catch (error) {
        setOutput((prev) => [...prev, `Error executing command: ${error}`]);
      }
    } else {
      setOutput((prev) => [...prev, `Command not found: ${command}. Type 'help' for available commands.`]);
    }

    // Add to history if not empty
    if (input.trim()) {
      setHistory((prev) => [input, ...prev].slice(0, 50)); // Keep last 50 commands
    }

    setCurrentInput('');
    setHistoryIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      // Navigate command history (older)
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      // Navigate command history (newer)
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  const focusInput = () => {
    if (allowUserInput && inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (autoFocus) {
      focusInput();
    }
  }, [autoFocus]);

  return (
    <div
      className={cn(
        'bg-[rgba(0,10,0,0.95)] border border-matrix-border rounded overflow-hidden font-matrix-hacker shadow-[0_0_20px_rgba(0,0,0,0.5),0_0_10px_var(--m-glow)]',
        className
      )}
      onClick={focusInput}
      style={{ height }}
    >
      {showHeader && (
        <div className="flex justify-between items-center p-2 bg-[rgba(0,20,0,0.7)] border-b border-matrix-border">
          <div className="text-sm font-bold text-matrix-text tracking-wider">{title}</div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
        </div>
      )}

      <div className="p-4 h-full flex flex-col">
        <div
          ref={outputRef}
          className="flex-1 overflow-y-auto mb-2 whitespace-pre-wrap"
        >
          {output.map((line, i) => (
            <div key={i} className="mb-1 leading-tight">
              {line}
            </div>
          ))}
        </div>

        {allowUserInput && !readOnly && (
          <div className="flex items-center">
            <span className="text-matrix-text-bright mr-2">{prompt}</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-matrix-text focus:text-matrix-text-bright caret-matrix-text"
              aria-label="Terminal input"
            />
            <span className="w-2.5 h-5 bg-matrix-text animate-[cursor-blink_1s_step-end_infinite]"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;

