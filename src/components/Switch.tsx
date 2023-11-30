import React, { ChangeEventHandler } from "react";

type props = {
    onChange: ChangeEventHandler<HTMLInputElement>;
    id: string;
    checked?: true;
    before: any;
    after: any
};

export const Switch: React.FC<props> = (p: props) => {
    return (
        <label htmlFor={p.id} className="inline-block">
            {p.before}
            <span className="input-switch ">
                <input checked={p.checked||false} className="inline-block" id={p.id} type="checkbox" onChange={p.onChange} />
                <span className="slider inline-block"></span>
            </span>
            {p.after}
        </label>
    );
};
