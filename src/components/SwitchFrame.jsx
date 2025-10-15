import React from 'react';

export default function SwitchFrame() {
  return (
    <div className="switch-frame">
      <iframe
        src="https://switch-food-explorer.posti.world/recipe-creation"
        title="Switch Food Explorer"
        className="switch-iframe"
        allow="clipboard-write"
      />
    </div>
  );
}
