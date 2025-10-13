/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
	FC,
	memo,
	useCallback,
	useMemo,
	useRef,
	useState,
	KeyboardEvent,
} from "react";

export type Highlighter = (code: string) => React.ReactNode;

type ConsoleViewProps = {
	value: unknown;
	highlighter?: Highlighter;
	inlineLimit?: number;
	initiallyExpanded?: string[];
	className?: string;
};

type NodeInfo = {
	type: string;
	preview: string;
	isExpandable: boolean;
	size?: number;
	class?: string;
};

const DEFAULT_INLINE_LIMIT = 100;

function getNodeInfo(value: unknown): NodeInfo {
	if (value === null)
		return { type: "null", preview: "null", isExpandable: false };
	const t = typeof value;
	if (t === "undefined")
		return { type: "undefined", preview: "undefined", isExpandable: false };
	if (t === "boolean")
		return { type: "boolean", preview: String(value), isExpandable: false };
	if (t === "number") {
		const preview = Object.is(value, -0) ? "-0" : String(value);
		return { type: "number", preview, isExpandable: false };
	}
	if (t === "bigint")
		return {
			type: "bigint",
			preview: String(value) + "n",
			isExpandable: false,
		};
	if (t === "string")
		return { type: "string", preview: String(value), isExpandable: false };
	if (t === "symbol")
		return {
			type: "symbol",
			preview: value?.toString() || "",
			isExpandable: false,
		};
	if (t === "function") {
		const name = (value as { name?: string }).name || "anonymous";
		return { type: "function", preview: name, isExpandable: true };
	}

	const obj = value as object;
	const className = Object.prototype.toString.call(obj).slice(8, -1);

	switch (className) {
		case "Array":
			return {
				type: "array",
				preview: "",
				isExpandable: true,
				size: (obj as any).length,
				class: "Array",
			};
		case "Object":
			return {
				type: "object",
				preview: "",
				isExpandable: true,
				class: "Object",
			};
		case "Map":
			return {
				type: "map",
				preview: "",
				isExpandable: true,
				size: (obj as any).size,
				class: "Map",
			};
		case "Set":
			return {
				type: "set",
				preview: "",
				isExpandable: true,
				size: (obj as any).size,
				class: "Set",
			};
		case "Date":
			return {
				type: "date",
				preview: (obj as any).toISOString(),
				isExpandable: false,
				class: "Date",
			};
		case "RegExp":
			return {
				type: "regexp",
				preview: (obj as any).toString(),
				isExpandable: false,
				class: "RegExp",
			};
		case "Error":
			return {
				type: "error",
				preview: (obj as any).message || "",
				isExpandable: true,
				class: className,
			};
		default:
			if (ArrayBuffer.isView(obj as any)) {
				const name = (obj as any).constructor?.name || className;
				return {
					type: "typedarray",
					preview: "",
					isExpandable: true,
					size: (obj as any).length,
					class: name,
				};
			}
			return {
				type: "object",
				preview: "",
				isExpandable: true,
				class: className,
			};
	}
}

function getEntries(value: any): Array<[string, any]> {
	if (value == null) return [];
	if (Array.isArray(value)) {
		return value.map((v, i) => [String(i), v]);
	}
	if (value instanceof Map) {
		return Array.from(value.entries()).map(([k, v]) => [`${String(k)}`, v]);
	}
	if (value instanceof Set) {
		return Array.from(value.values()).map((v, i) => [String(i), v]);
	}
	try {
		return Object.entries(value);
	} catch {
		return [];
	}
}

class CircularRefTracker {
	private refs = new WeakMap<object, number>();
	private counter = 1;

	getId(obj: object): number {
		let id = this.refs.get(obj);
		if (!id) {
			id = this.counter++;
			this.refs.set(obj, id);
		}
		return id;
	}
}

export const ConsoleArg: FC<ConsoleViewProps> = memo(function ConsoleView({
	value,
	highlighter,
	inlineLimit = DEFAULT_INLINE_LIMIT,
	initiallyExpanded = [],
	className,
}) {
	const [expanded, setExpanded] = useState<Set<string>>(
		() => new Set(initiallyExpanded)
	);
	const trackerRef = useRef(new CircularRefTracker());
	const seenRefs = useRef(new WeakSet<object>());

	const toggle = useCallback((path: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(path)) next.delete(path);
			else next.add(path);
			return next;
		});
	}, []);

	return (
		<div
			className={className}
			style={{
				fontSize: "11px",
				lineHeight: "15px",
				color: "#242424",
				padding: "2px 0",
			}}
		>
			<ValueNode
				value={value}
				path="root"
				depth={0}
				expanded={expanded}
				toggle={toggle}
				tracker={trackerRef.current}
				seenRefs={seenRefs.current}
				highlighter={highlighter}
				inlineLimit={inlineLimit}
			/>
		</div>
	);
});

type ValueNodeProps = {
	value: any;
	path: string;
	depth: number;
	expanded: Set<string>;
	toggle: (path: string) => void;
	tracker: CircularRefTracker;
	seenRefs: WeakSet<object>;
	highlighter?: Highlighter;
	inlineLimit: number;
	label?: string;
};

const ValueNode: FC<ValueNodeProps> = memo(function ValueNode({
	value,
	path,
	depth,
	expanded,
	toggle,
	tracker,
	seenRefs,
	highlighter,
	inlineLimit,
	label,
}) {
	const info = useMemo(() => getNodeInfo(value), [value]);
	const isExpanded = expanded.has(path);

	const circularId = useMemo(() => {
		if (info.isExpandable && typeof value === "object" && value !== null) {
			return tracker.getId(value);
		}
		return null;
	}, [info.isExpandable, value, tracker]);

	const isCircular = useMemo(() => {
		if (info.isExpandable && typeof value === "object" && value !== null) {
			if (seenRefs.has(value)) return true;
			return false;
		}
		return false;
	}, [info.isExpandable, value, seenRefs]);

	const entries = useMemo(() => {
		if (!info.isExpandable || !isExpanded || isCircular) return [];
		return getEntries(value);
	}, [info.isExpandable, isExpanded, isCircular, value]);

	const hasChildren =
		info.isExpandable && !isCircular && getEntries(value).length > 0;

	const renderPrimitivePreview = (v: any, maxLen = 50): string => {
		if (v === null) return "null";
		if (v === undefined) return "undefined";
		const t = typeof v;
		if (t === "string") {
			const escaped = v
				.replace(/\\/g, "\\\\")
				.replace(/"/g, '\\"')
				.replace(/\n/g, "\\n");
			return escaped.length > maxLen
				? `"${escaped.slice(0, maxLen)}…"`
				: `"${escaped}"`;
		}
		if (t === "number" || t === "boolean") return String(v);
		if (t === "bigint") return String(v) + "n";
		if (t === "function")
			return `ƒ ${(v as { name?: string }).name || "anonymous"}()`;
		if (t === "object") {
			if (Array.isArray(v)) return `Array(${v.length})`;
			return "Object";
		}
		return String(v);
	};

	const renderInlinePreview = (): string => {
		if (!info.isExpandable || isExpanded) return "";

		if (info.type === "array") {
			const arr = value as any[];
			if (arr.length === 0) return "(0) []";
			const items = arr.slice(0, 3).map((v) => renderPrimitivePreview(v, 20));
			const preview = items.join(", ");
			const suffix = arr.length > 3 ? ", …" : "";
			return `(${arr.length}) [${preview}${suffix}]`;
		}

		if (info.type === "object") {
			const entries = Object.entries(value as object);
			if (entries.length === 0) return "{}";
			const items = entries
				.slice(0, 3)
				.map(([k, v]) => `${k}: ${renderPrimitivePreview(v, 15)}`);
			const preview = items.join(", ");
			const suffix = entries.length > 3 ? ", …" : "";
			return `{${preview}${suffix}}`;
		}

		if (info.type === "map") {
			return `Map(${info.size || 0})`;
		}

		if (info.type === "set") {
			return `Set(${info.size || 0})`;
		}

		return "";
	};

	const renderValue = () => {
		if (isCircular) {
			return (
				<span style={{ color: "#808080", fontStyle: "italic" }}>
					[Circular *{circularId}]
				</span>
			);
		}

		// Primitives
		if (info.type === "string") {
			const str = info.preview;
			const color = "#c41a16";
			return <span style={{ color }}>&quot;{str}&quot;</span>;
		}
		if (info.type === "number") {
			return <span style={{ color: "#1c00cf" }}>{info.preview}</span>;
		}
		if (info.type === "bigint") {
			return <span style={{ color: "#1c00cf" }}>{info.preview}</span>;
		}
		if (info.type === "boolean") {
			return <span style={{ color: "#0d22aa" }}>{info.preview}</span>;
		}
		if (info.type === "null") {
			return <span style={{ color: "#808080" }}>null</span>;
		}
		if (info.type === "undefined") {
			return <span style={{ color: "#808080" }}>undefined</span>;
		}
		if (info.type === "symbol") {
			return <span style={{ color: "#c41a16" }}>{info.preview}</span>;
		}

		// Special objects
		if (info.type === "date") {
			return (
				<span style={{ color: "#808080" }}>
					{info.class} {info.preview}
				</span>
			);
		}
		if (info.type === "regexp") {
			return <span style={{ color: "#c41a16" }}>{info.preview}</span>;
		}

		// Functions
		if (info.type === "function") {
			return (
				<span style={{ color: "#5e5e5e", fontStyle: "italic" }}>
					ƒ {info.preview}()
				</span>
			);
		}

		// Expandable objects
		const className = info.class || "Object";
		const preview = renderInlinePreview();

		return (
			<>
				<span
					style={{
						color: "#5e5e5e",
						fontWeight: depth === 0 ? "normal" : "normal",
					}}
				>
					{className}
				</span>
				{preview && (
					<span style={{ color: "#808080", marginLeft: "4px" }}>{preview}</span>
				)}
				{circularId && depth > 0 && (
					<span
						style={{ color: "#c0c0c0", fontSize: "10px", marginLeft: "4px" }}
					>
						*{circularId}
					</span>
				)}
			</>
		);
	};

	const handleClick = (e: React.MouseEvent) => {
		if (hasChildren) {
			e.preventDefault();
			toggle(path);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (hasChildren && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			toggle(path);
		}
	};

	// Track this reference
	if (
		info.isExpandable &&
		typeof value === "object" &&
		value !== null &&
		isExpanded
	) {
		seenRefs.add(value);
	}

	return (
		<div style={{ position: "relative" }}>
			<div
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				tabIndex={hasChildren ? 0 : -1}
				style={{
					display: "flex",
					alignItems: "flex-start",
					cursor: hasChildren ? "pointer" : "default",
					outline: "none",
					paddingLeft: depth > 0 ? "12px" : "0",
					userSelect: "text",
				}}
			>
				{hasChildren && (
					<span
						style={{
							display: "inline-block",
							width: "12px",
							height: "15px",
							marginRight: "2px",
							fontSize: "10px",
							color: "#727272",
							transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
							transition: "transform 0.1s ease",
							flexShrink: 0,
						}}
					>
						▶
					</span>
				)}
				{!hasChildren && depth > 0 && (
					<span style={{ width: "14px", flexShrink: 0 }} />
				)}

				{label && (
					<span style={{ color: "#881391", marginRight: "4px" }}>{label}:</span>
				)}

				<span style={{ wordBreak: "break-word" }}>{renderValue()}</span>
			</div>

			{isExpanded && hasChildren && (
				<div style={{ marginLeft: depth === 0 ? "12px" : "0" }}>
					{entries.map(([key, val]) => (
						<ValueNode
							key={`${path}.${key}`}
							value={val}
							path={`${path}.${key}`}
							depth={depth + 1}
							expanded={expanded}
							toggle={toggle}
							tracker={tracker}
							seenRefs={seenRefs}
							highlighter={highlighter}
							inlineLimit={inlineLimit}
							label={key}
						/>
					))}
					{entries.length === 0 && (
						<div
							style={{
								color: "#808080",
								paddingLeft: "12px",
								fontStyle: "italic",
							}}
						>
							(empty)
						</div>
					)}
				</div>
			)}
		</div>
	);
});
