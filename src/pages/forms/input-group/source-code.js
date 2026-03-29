export const basicInputGroups = `
import Textinput from "@/components/ui/Textinput";
const BasicInputGroup = () => {
    return (
        <div className=" space-y-4">
            <Textinput
                type="text"
                label="Prepend Addon"
                placeholder="Username"
                prepend="@"
            />
            <Textinput
                type="text"
                placeholder="Username"
                label="Append Addon"
                append="@facebook.com"
            />
            <Textinput
                type="text"
                placeholder="Username"
                label="Between input:"
                prepend="$"
                append="120"
            />
        </div>
    );
};
export default BasicInputGroup;
`
export const mergedAddon = `
import Textinput from "@/components/ui/Textinput";
const BasicInputGroup = () => {
    return (
        <>
            <Textinput
                type="text"
                label="Prepend Addon"
                placeholder="Username"
                prepend="@"
            />
            <Textinput
                type="text"
                placeholder="Username"
                label="Append Addon"
                append="@facebook.com"
            />
            <Textinput
                type="text"
                placeholder="Username"
                label="Between input:"
                prepend="$"
                append="120"
            />
        </>
    );
};
export default BasicInputGroup;
`