"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, WandSparkles } from "lucide-react";

export type VariantOptionGroup = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariantDraft = {
  id: string;
  variant_name: string;
  option_values: Record<string, string>;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock_quantity: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

type ProductVariantsEditorProps = {
  groups: VariantOptionGroup[];
  variants: ProductVariantDraft[];
  onGroupsChange: (groups: VariantOptionGroup[]) => void;
  onVariantsChange: (variants: ProductVariantDraft[]) => void;
  baseSku?: string;
};

function buildCombinations(
  groups: VariantOptionGroup[],
): Record<string, string>[] {
  const usableGroups = groups
    .map((group) => ({
      name: group.name.trim(),
      values: [
        ...new Set(group.values.map((value) => value.trim()).filter(Boolean)),
      ],
    }))
    .filter((group) => group.name && group.values.length > 0);

  if (usableGroups.length === 0) return [];

  return usableGroups.reduce<Record<string, string>[]>(
    (combinations, group) =>
      combinations.flatMap((combination) =>
        group.values.map((value) => ({
          ...combination,
          [group.name]: value,
        })),
      ),
    [{}],
  );
}

const inputClass =
  "w-full rounded-lg border border-[#e4d9cf] bg-[#fffdfa] px-3 py-2.5 text-sm text-[#3b1020] placeholder:text-[#a7958b] outline-none transition focus:border-[#b58a62] focus:ring-2 focus:ring-[#b58a62]/10";

export default function ProductVariantsEditor({
  groups,
  variants,
  onGroupsChange,
  onVariantsChange,
  baseSku = "",
}: ProductVariantsEditorProps) {
  const [groupName, setGroupName] = useState("");
  const [groupValues, setGroupValues] = useState("");

  const combinations = useMemo(() => buildCombinations(groups), [groups]);

  function generateVariants() {
    if (groups.length === 0) {
      alert("Add at least one option group first.");
      return;
    }

    const invalidGroup = groups.find(
      (group) =>
        !group.name.trim() ||
        group.values.filter((value) => value.trim()).length === 0,
    );

    if (invalidGroup) {
      alert("Every option group must have a name and at least one value.");
      return;
    }

    const duplicateNames = groups
      .map((group) => group.name.trim().toLowerCase())
      .filter((name, index, all) => all.indexOf(name) !== index);

    if (duplicateNames.length > 0) {
      alert("Option group names must be unique. Use Size and Color.");
      return;
    }

    const existingVariants = new Map(
      variants.map((variant) => [
        JSON.stringify(variant.option_values),
        variant,
      ]),
    );

    const nextVariants = combinations.map((optionValues, index) => {
      const existing = existingVariants.get(JSON.stringify(optionValues));

      if (existing) {
        return {
          ...existing,
          variant_name: Object.values(optionValues).join(" / "),
          option_values: optionValues,
          sort_order: index,
        };
      }

      return {
        id: crypto.randomUUID(),
        variant_name: Object.values(optionValues).join(" / "),
        option_values: optionValues,
        sku: baseSku ? `${baseSku}-${String(index + 1).padStart(3, "0")}` : "",
        price: "",
        compareAtPrice: "",
        stock_quantity: "0",
        image_url: "",
        is_active: true,
        sort_order: index,
      };
    });

    onVariantsChange(nextVariants);
  }

  function addOptionGroup() {
    const name = groupName.trim();
    const values = groupValues
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!name || values.length === 0) {
      alert("Enter an option name and at least one value.");
      return;
    }

    if (
      groups.some(
        (group) => group.name.trim().toLowerCase() === name.toLowerCase(),
      )
    ) {
      alert(`"${name}" already exists. Use a different option name.`);
      return;
    }

    onGroupsChange([
      ...groups,
      {
        id: crypto.randomUUID(),
        name,
        values: [...new Set(values)],
      },
    ]);

    setGroupName("");
    setGroupValues("");
  }

  function updateGroupValues(id: string, value: string) {
    const values = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    onGroupsChange(
      groups.map((group) =>
        group.id === id ? { ...group, values: [...new Set(values)] } : group,
      ),
    );
  }

  function removeGroup(id: string) {
    const group = groups.find((item) => item.id === id);
    if (!group) return;

    const updatedGroups = groups.filter((item) => item.id !== id);

    const updatedVariants = variants.map((variant) => {
      const optionValues = { ...variant.option_values };
      delete optionValues[group.name];

      return {
        ...variant,
        option_values: optionValues,
        variant_name: Object.values(optionValues).join(" / "),
      };
    });

    onGroupsChange(updatedGroups);
    onVariantsChange(updatedVariants);
  }

  function updateVariant(id: string, updates: Partial<ProductVariantDraft>) {
    onVariantsChange(
      variants.map((variant) =>
        variant.id === id ? { ...variant, ...updates } : variant,
      ),
    );
  }

  function removeVariant(id: string) {
    onVariantsChange(variants.filter((variant) => variant.id !== id));
  }

  const totalStock = variants.reduce(
    (total, variant) =>
      total +
      (variant.is_active
        ? Math.max(0, Number(variant.stock_quantity) || 0)
        : 0),
    0,
  );

  return (
    <div className="space-y-6 text-[#3b1020]">
      {/* Product Options */}
      <div className="rounded-xl border border-[#e8ded5] bg-[#fffdfa] p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-[#3b1020]">
            Product Options
          </h3>
          <p className="mt-1 text-sm text-[#8b7168]">
            Add options such as Size, Color, Material, or Storage.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Option name (e.g. Size)"
            className={inputClass}
          />

          <input
            value={groupValues}
            onChange={(event) => setGroupValues(event.target.value)}
            placeholder="Values (e.g. S, M, L, XL)"
            className={inputClass}
          />
        </div>

        <button
          type="button"
          onClick={addOptionGroup}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#c49a68]/40 bg-[#c49a68]/10 px-4 py-2.5 text-sm font-medium text-[#76512f] transition hover:bg-[#c49a68]/20"
        >
          <Plus size={16} />
          Add Option
        </button>

        {groups.length > 0 && (
          <div className="mt-6 space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="rounded-lg border border-[#e9dfd6] bg-[#f8f3ed] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#451326]">
                    {group.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeGroup(group.id)}
                    className="text-[#a28b7d] transition hover:text-red-700"
                    aria-label={`Remove ${group.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <input
                  value={group.values.join(", ")}
                  onChange={(event) =>
                    updateGroupValues(group.id, event.target.value)
                  }
                  placeholder="Comma-separated values"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Variants */}
      <div className="rounded-xl border border-[#e8ded5] bg-[#fffdfa] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#3b1020]">
              Generated Variants
            </h3>
            <p className="mt-1 text-sm text-[#8b7168]">
              Generate every possible combination of your options.
            </p>
          </div>

          <button
            type="button"
            onClick={generateVariants}
            disabled={groups.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#451326] px-4 py-2.5 text-sm font-semibold text-[#f8f3ed] transition hover:bg-[#5b1932] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <WandSparkles size={16} />
            Generate Variants
          </button>
        </div>

        {variants.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-b border-[#eee5dc] pb-4 text-sm text-[#8b7168]">
            <span>
              Variants:{" "}
              <strong className="font-semibold text-[#451326]">
                {variants.length}
              </strong>
            </span>

            <span>
              Active stock:{" "}
              <strong className="font-semibold text-[#451326]">
                {totalStock}
              </strong>
            </span>
          </div>
        )}

        {variants.length > 0 ? (
          <div className="mt-5 space-y-3">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-lg border border-[#e9dfd6] bg-[#f8f3ed] p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#451326]">
                      {variant.variant_name}
                    </p>

                    <p className="mt-1 text-xs text-[#927b70]">
                      {Object.entries(variant.option_values)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" · ")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    className="text-[#a28b7d] transition hover:text-red-700"
                    aria-label={`Remove ${variant.variant_name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="space-y-1.5">
                    <span className="block text-xs font-medium text-[#826b60]">
                      SKU
                    </span>
                    <input
                      value={variant.sku}
                      onChange={(event) =>
                        updateVariant(variant.id, {
                          sku: event.target.value,
                        })
                      }
                      placeholder="Variant SKU"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-xs font-medium text-[#826b60]">
                      Price (৳)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(event) =>
                        updateVariant(variant.id, {
                          price: event.target.value,
                        })
                      }
                      placeholder="Base price"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-xs font-medium text-[#826b60]">
                      Compare-at Price (৳)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.compareAtPrice}
                      onChange={(event) =>
                        updateVariant(variant.id, {
                          compareAtPrice: event.target.value,
                        })
                      }
                      placeholder="Optional"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="block text-xs font-medium text-[#826b60]">
                      Stock Quantity
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={variant.stock_quantity}
                      onChange={(event) =>
                        updateVariant(variant.id, {
                          stock_quantity: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-[#765f55]">
                  <input
                    type="checkbox"
                    checked={variant.is_active}
                    onChange={(event) =>
                      updateVariant(variant.id, {
                        is_active: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#64152c]"
                  />
                  Variant is active
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-[#dfd2c7] bg-[#faf6f1] py-12 text-center">
            <p className="text-sm font-medium text-[#765f55]">
              No variants generated yet.
            </p>
            <p className="mt-1 text-xs text-[#a18c81]">
              Add Size and Color options, then click Generate Variants.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
