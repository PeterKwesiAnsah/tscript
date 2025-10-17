import React, { FC, memo, useMemo, useState } from "react";
import { ConsoleArg } from "./ConsoleArg";
import { ConsoleProxy } from "./proxy";

export type ConsoleMethod =
	| "log"
	| "info"
	| "warn"
	| "error"
	| "debug"
	| "table"
	| "dir";

export type ConsoleMessage = {
	method: ConsoleMethod;
	args: unknown[];
	timestamp: number;
	id?: string;
};

type ConsoleLoggerProps = {
	className?: string;
	showTimestamps?: boolean;
	showMethod?: boolean;
	maxHeight?: string | number;
};

const ConsoleLogger: FC<ConsoleLoggerProps> = memo(function ConsoleLogger({
	className,
	showTimestamps = true,
	showMethod = false,
	maxHeight = "600px",
}) {
	const consoleProxy = useState(() => new ConsoleProxy())[0];
	const [messages, setMessages] = useState<ConsoleMessage[]>([]);

	React.useEffect(() => {
		const badge = document.getElementById("console_button_badge");
		consoleProxy.onMessage((msg) => {
			if (!badge) return;
			badge.classList.remove("hidden");
			badge.textContent = String(messages.length + 1);
			setMessages((prev) => [...prev, msg]);
		});
	}, [messages]);

	return (
		<div
			className={className}
			style={{
				overflow: "auto",
				maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
			}}
		>
			{messages.length === 0 ? (
				<div
					style={{
						padding: "16px",
						color: "#9ca3af",
						fontStyle: "italic",
						textAlign: "center",
					}}
				>
					No console messages
				</div>
			) : (
				messages.map((msg, idx) => (
					<ConsoleLogEntry
						key={msg.id || idx}
						message={msg}
						showTimestamp={showTimestamps}
						showMethod={showMethod}
					/>
				))
			)}
		</div>
	);
});
export default ConsoleLogger;

type ConsoleLogEntryProps = {
	message: ConsoleMessage;
	showTimestamp: boolean;
	showMethod: boolean;
};

const ConsoleLogEntry: FC<ConsoleLogEntryProps> = memo(
	function ConsoleLogEntry({ message, showTimestamp, showMethod }) {
		const { method, args, timestamp } = message;

		const methodStyles = useMemo(() => {
			switch (method) {
				case "error":
					return {
						icon: "❌",
						iconColor: "#dc2626",
						textColor: "#991b1b",
					};
				case "warn":
					return {
						icon: "⚠️",
						iconColor: "#d97706",
						textColor: "#92400e",
					};
				case "info":
					return {
						icon: "ℹ️",
						iconColor: "#2563eb",
						textColor: "#1e40af",
					};
				case "debug":
					return {
						icon: "🐛",
						iconColor: "#7c3aed",
						textColor: "#5b21b6",
					};
				default:
					return {
						icon: "",
						iconColor: "#6b7280",
						textColor: "#111827",
					};
			}
		}, [method]);

		const formatTimestamp = (ts: number) => {
			const date = new Date(ts);
			const hours = String(date.getHours()).padStart(2, "0");
			const minutes = String(date.getMinutes()).padStart(2, "0");
			const seconds = String(date.getSeconds()).padStart(2, "0");
			const ms = String(date.getMilliseconds()).padStart(3, "0");
			return `${hours}:${minutes}:${seconds}.${ms}`;
		};

		return (
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					padding: "4px 8px",
					backgroundColor: "transparent",
					minHeight: "23px",
				}}
			>
				{methodStyles.icon && (
					<span
						style={{
							marginRight: "6px",
							fontSize: "11px",
							flexShrink: 0,
							opacity: 0.9,
						}}
					>
						{methodStyles.icon}
					</span>
				)}
				{showTimestamp && (
					<span
						style={{
							color: "#9ca3af",
							marginRight: "8px",
							fontSize: "10px",
							fontFamily: "inherit",
							flexShrink: 0,
							lineHeight: "15px",
						}}
					>
						{formatTimestamp(timestamp)}
					</span>
				)}
				{showMethod && (
					<span
						style={{
							color: methodStyles.iconColor,
							marginRight: "8px",
							fontSize: "10px",
							fontWeight: 600,
							textTransform: "uppercase",
							flexShrink: 0,
							lineHeight: "15px",
						}}
					>
						{method}
					</span>
				)}
				<div
					style={{
						flex: 1,
						display: "flex",
						flexWrap: "wrap",
						gap: "4px",
						alignItems: "flex-start",
					}}
				>
					{args.map((arg, idx) => (
						<React.Fragment key={idx}>
							<ConsoleArg value={arg} />
							{idx < args.length - 1 && (
								<span style={{ color: "#6b7280" }}> </span>
							)}
						</React.Fragment>
					))}
				</div>
			</div>
		);
	}
);
