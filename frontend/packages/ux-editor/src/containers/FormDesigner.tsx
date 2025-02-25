import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import FileEditor from 'app-shared/file-editor/FileEditor';
import { RightMenu } from '../components/rightMenu/RightMenu';
import { filterDataModelForIntellisense } from '../utils/datamodel';
import { DesignView } from './DesignView';
import type { IDataModelFieldElement, IFormLayoutOrder, LogicMode } from '../types/global';
import { FormLayoutActions } from '../features/formDesigner/formLayout/formLayoutSlice';
import { makeGetLayoutOrderSelector } from '../selectors/getLayoutData';
import { deepCopy } from 'app-shared/pure';
import classes from './FormDesigner.module.css';
import { LeftMenu } from '../components/leftMenu/LeftMenu';
import { useText } from '../hooks';
import { useParams } from 'react-router-dom';

type FormDesignerProps = {
  selectedLayout: string;
  dataModel: IDataModelFieldElement[];
  activeList: any;
  layoutOrder: IFormLayoutOrder;
};
export const FormDesigner = ({
  activeList,
  layoutOrder,
  selectedLayout,
  dataModel,
}: FormDesignerProps): JSX.Element => {
  const dispatch = useDispatch();
  const { org, app } = useParams();
  const [codeEditorOpen, setCodeEditorOpen] = useState<boolean>(false);
  const [codeEditorMode, setCodeEditorMode] = useState<LogicMode>(null);
  const order = useSelector(makeGetLayoutOrderSelector());
  const layoutOrderCopy = deepCopy(layoutOrder || {});
  const t = useText();

  useEffect((): void => {
    const addInitialPage = (): void => {
      const name = `${t('general.page')}1`;
      dispatch(FormLayoutActions.addLayout({ layout: name, isReceiptPage: false, org, app }));
    };

    const layoutsExist = layoutOrder && !Object.keys(layoutOrder).length;
    // Old apps might have selectedLayout='default' even when there exist a single layout.
    // Should only add initial page if no layouts exist.
    if (selectedLayout === 'default' && !layoutsExist) {
      addInitialPage();
    }
  }, [app, dispatch, org, selectedLayout, t, layoutOrder]);

  useEffect(() => {
    if (codeEditorOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [codeEditorOpen]);

  const toggleCodeEditor = (mode?: LogicMode) => {
    setCodeEditorOpen(!codeEditorOpen);
    setCodeEditorMode(mode || null);
  };

  const getDataModelSuggestions = (filterText: string): IDataModelFieldElement[] => {
    return filterDataModelForIntellisense(dataModel, filterText);
  };

  const getEditorHeight = () => {
    const height = document.getElementById('formFillerGrid').clientHeight;
    const editorHeight = height - 20;
    return editorHeight.toString();
  };

  const renderLogicEditor = () => {
    return (
      <div className={classes.logicEditor}>
        <div>
          <FileEditor
            editorHeight={getEditorHeight()}
            mode={codeEditorMode.toString()}
            closeFileEditor={toggleCodeEditor}
            getDataModelSuggestions={getDataModelSuggestions}
            boxShadow={true}
          />
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={classes.root}>
        <div className={classes.container} id='formFillerGrid'>
          <div className={classes.leftContent + ' ' + classes.item}>
            <LeftMenu />
          </div>
          <div className={classes.mainContent + ' ' + classes.item}>
            <h1 className={classes.pageHeader}>{selectedLayout}</h1>
            <DesignView
              order={order}
              activeList={activeList}
              isDragging={false}
              layoutOrder={layoutOrderCopy}
            />
            {codeEditorOpen ? renderLogicEditor() : null}
          </div>
          <div className={classes.rightContent + ' ' + classes.item}>
            <RightMenu toggleFileEditor={toggleCodeEditor} />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
