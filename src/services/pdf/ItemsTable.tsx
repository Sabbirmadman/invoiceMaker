import { View, Text } from "@react-pdf/renderer";
import type { LineItem } from "@/types/document";
import { boldFont } from "./fonts";
import {
    COLUMN_LABELS,
    getColViewStyle,
    getColAlign,
    cellValue,
} from "./tableColumns";

interface Props {
    items: LineItem[];
    columns: string[];
    currency: string;
    headerBg: string;
    headerColor: string;
    altRowColor: string;
    font: string;
}

export function TemplateItemsTable({
    items,
    columns,
    currency,
    headerBg,
    headerColor,
    altRowColor,
    font,
}: Props) {
    const bold = boldFont(font);
    return (
        <View style={{ marginBottom: 4 }}>
            {/* Header row */}
            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: headerBg,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                }}
            >
                <View style={{ width: 32 }}>
                    <Text
                        style={{
                            color: headerColor,
                            fontSize: 9,
                            fontFamily: bold,
                        }}
                    >
                        #
                    </Text>
                </View>
                {columns.map((col) => (
                    <View key={col} style={getColViewStyle(col)}>
                        <Text
                            style={{
                                color: headerColor,
                                fontSize: 9,
                                fontFamily: bold,
                                textAlign: getColAlign(col),
                            }}
                        >
                            {COLUMN_LABELS[col] ?? col}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Data rows */}
            {items.map((item, idx) => (
                <View
                    key={item.id}
                    style={{
                        flexDirection: "row",
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f1f5f9",
                        backgroundColor:
                            idx % 2 === 1 ? altRowColor : "transparent",
                    }}
                >
                    <View style={{ width: 32 }}>
                        <Text style={{ fontSize: 9 }}>{idx + 1}</Text>
                    </View>
                    {columns.map((col) => (
                        <View key={col} style={getColViewStyle(col)}>
                            <Text
                                style={{
                                    fontSize: 9,
                                    textAlign: getColAlign(col),
                                }}
                            >
                                {cellValue(item, col, currency)}
                            </Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}
