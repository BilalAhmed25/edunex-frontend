import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";

const Fullscreen = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    return (
        <div 
            className="lg:h-[32px] lg:w-[32px] lg:bg-slate-100 lg:dark:bg-slate-800 text-slate-800 dark:text-white flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
            <Icon 
                icon={isFullscreen ? "heroicons-outline:arrows-pointing-in" : "heroicons-outline:arrows-pointing-out"} 
                className="text-xl"
            />
        </div>
    );
};

export default Fullscreen;
