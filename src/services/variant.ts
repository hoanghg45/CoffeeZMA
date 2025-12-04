import { Variant, Option } from "../types/product";
import { pool } from "./db";

export const getVariants = async (): Promise<Variant[]> => {
  try {
    // Fetch option groups (Variants)
    const groupsQuery = await pool.query(
      "SELECT id, name as label, selection_type as type FROM option_groups"
    );
    
    // Fetch options
    const optionsQuery = await pool.query(
      "SELECT id, option_group_id, name as label, price_adjustment, adjustment_type FROM options ORDER BY id"
    );

    const groups = groupsQuery.rows;
    const options = optionsQuery.rows;

    // Map options to groups
    const variants: Variant[] = groups.map((group) => {
      const groupOptions = options
        .filter((opt) => opt.option_group_id === group.id)
        .map((opt) => {
          const option: Option = {
            id: opt.id,
            label: opt.label,
          };

          if (opt.price_adjustment && parseFloat(opt.price_adjustment) !== 0) {
            if (opt.adjustment_type === "PERCENT") {
              option.priceChange = {
                type: "percent",
                percent: parseFloat(opt.price_adjustment),
              };
            } else {
              option.priceChange = {
                type: "fixed",
                amount: parseFloat(opt.price_adjustment), // DB usually stores fixed as amount
              };
            }
          }
          return option;
        });

      return {
        id: group.id,
        label: group.label,
        type: group.type.toLowerCase() as "single" | "multiple",
        options: groupOptions,
        default: group.type === "SINGLE" ? groupOptions[0]?.id : [], // Simple default logic
      } as Variant;
    });

    return variants;
  } catch (error) {
    console.error("Error fetching variants:", error);
    return [];
  }
};

