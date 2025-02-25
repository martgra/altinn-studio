import React from 'react';
import classes from './RightMenu.module.css';
import type { LogicMode } from '../../types/global';
import { Tabs } from '@digdir/design-system-react';
import { ConditionalRenderingTab } from './ConditionalRenderingTab';
import { CalculationsTab } from './CalculationsTab';
import { ContentTab } from './ContentTab';
import { useText } from '../../hooks';

export interface RightMenuProps {
  toggleFileEditor: (mode?: LogicMode) => void;
}

export const RightMenu = ({ toggleFileEditor }: RightMenuProps) => {
  const t = useText();
  return (
    <div className={classes.main} data-testid={'ux-editor.right-menu'}>
      <Tabs
        items={[
          {
            name: t('right_menu.content'),
            content: <ContentTab />,
          },
          {
            name: t('right_menu.conditional_rendering'),
            content: <ConditionalRenderingTab toggleFileEditor={toggleFileEditor} />,
          },
          {
            name: t('right_menu.calculations'),
            content: <CalculationsTab toggleFileEditor={toggleFileEditor} />,
          },
        ]}
      />
    </div>
  );
};
