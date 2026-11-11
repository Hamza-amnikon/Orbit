export function savedTaxSelection(item)
{
    let version = "";
    try
    {
        version = JSON.parse(item?.taxSettingSnapshotJson || "null")?.rowVersion || "";
    }
    catch
    {
        version = "";
    }
    return {
        taxSettingId: item?.taxSettingId || (Number(item?.taxRate) > 0 ? "legacy" : ""),
        taxSettingRowVersion: version
    };
}

export function validateTaxSelections(items, choices)
{
    const treatments = new Set();
    for (const [index, item] of items.entries())
    {
        if (!item.taxSettingId)
        {
            continue;
        }
        const selected = choices.find(row => row.id === Number(item.taxSettingId));
        if (!selected || selected.rowVersion !== item.taxSettingRowVersion)
        {
            throw new Error(`Select a currently valid saved tax setting or No tax on line ${index + 1}.`);
        }
        treatments.add(selected.treatment);
    }
    if (treatments.size > 1)
    {
        throw new Error("Use the same tax treatment on all taxed lines of the document.");
    }
}
