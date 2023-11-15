import React, { MouseEventHandler } from "react";
import link from "next/link.js"; const Link = link.default
import clsx from "clsx";

const styles = {
    primary: {
        className: "rounded-md bg-blue-500 py-2 px-4 "+ 
            "text-sm font-semibold text-slate-900 "+
            "border border-solid border-blue-300/50 "+
            "hover:bg-blue-400 "+
            "focus:outline-none focus-visible:outline-2 "+
            "focus-visible:outline-offset-2 focus-visible:outline-sky-300/50 "+
            "active:bg-blue-400",
    },
    secondary: {
        className: "rounded-md bg-blue-900 py-2 px-4 text-sm font-medium "+
        "border border-solid border-blue-700/50 "+
        "text-neutral-400 hover:bg-slate-700 "+
        "focus:outline-none focus-visible:outline-2 "+
        "focus-visible:outline-offset-2 focus-visible:outline-white/50 "+
        "active:text-slate-400",
    }
};

interface propsType {
    children: any,
    style?: Record<string,any>;
    variant? : "primary" | "secondary",
    onClick: MouseEventHandler<any>,
    className? : string,
    href? : string
}
export  const Button : React.FC<propsType> = ({ 
    variant = "primary", 
    style={}, 
    children, 
    className,
    href,
     ...props 
}) => {
    const s = styles[variant];
    //@ts-expect-error importing clsx, argh!  webpack understands 
    //   it one way, typescript the opposite way
    className = clsx(s.className, className);
    return href ? (
        <Link {...{children, href, className, style, ...props}} />
    ) : (
        <button {...{children, className, style, ...props}} />
    );
}


{/* <button
className="btn border rounded float-right"
style={{
    padding: "0.75em",
    marginLeft: "0.5em",
    // marginTop: '-0.75em',
    border: "1px solid #162ed5",
    borderRadius: "0.5em",
    backgroundColor: "#142281",
}}
onClick={this.create}
>
List a Credential
</button> */}
