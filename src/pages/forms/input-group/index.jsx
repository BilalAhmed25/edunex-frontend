import React from "react";
import Card from "@/components/ui/code-snippet";
import BasicTextinputGroup from "./basic-input-group";
import { basicInputGroups, mergedAddon } from "./source-code";
import MergedAddon from "./merged-addon";

const TextinputGroupPage = () => {
    return (
        <div className=" space-y-5">
            <Card title="Input Group" code={basicInputGroups}>
                <BasicTextinputGroup />
            </Card>
            <Card title="Merged Addon" code={mergedAddon}>
                <MergedAddon />
            </Card>
        </div>
    );
};

export default TextinputGroupPage;
