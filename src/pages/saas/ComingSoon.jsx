import React from "react";

const ComingSoon = ({ title }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
    <div className="text-6xl mb-4">🚧</div>
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
    <p className="text-gray-500 dark:text-gray-400">This page is under construction.</p>
  </div>
);

export default ComingSoon;
