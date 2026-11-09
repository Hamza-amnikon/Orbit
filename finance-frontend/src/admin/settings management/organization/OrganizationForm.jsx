import ModuleForm from "../../shared/ModuleForm";

export default function OrganizationForm(props)
{
    const fields = props.fields.map(field =>
    {
        const savedCurrency = props.value.currency;

        if (field.name === "currency" && savedCurrency &&
            !field.options.includes(savedCurrency))
        {
            return {
                ...field,
                options: [
                    {
                        value: savedCurrency,
                        label: `${savedCurrency} (saved currency)`
                    },
                    ...field.options
                ]
            };
        }

        return field;
    });

    return <ModuleForm {...props} fields={fields} />;
}
