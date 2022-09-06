// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2018-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { Typography } from "@mui/material";
import { useContext, useState, useMemo, CSSProperties } from "react";
import { makeStyles } from "tss-react/mui";

import PanelContext from "@foxglove/studio-base/components/PanelContext";
import ToolbarIconButton from "@foxglove/studio-base/components/PanelToolbar/ToolbarIconButton";

import { PanelToolbarControls } from "./PanelToolbarControls";

export const PANEL_TOOLBAR_MIN_HEIGHT = 30;

type Props = {
  additionalIcons?: React.ReactNode;
  backgroundColor?: CSSProperties["backgroundColor"];
  children?: React.ReactNode;
  // Keeping this prop for now in case we decide to expose it via some other mechanism
  // like a context menu item.
  // eslint-disable-next-line react/no-unused-prop-types
  helpContent?: React.ReactNode;
  isUnknownPanel?: boolean;
};

const useStyles = makeStyles()((theme) => ({
  root: {
    transition: theme.transitions.create(["transform", "opacity"], { duration: 80 }),
    flex: "0 0 auto",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0.25, 0.75),
    display: "flex",
    minHeight: PANEL_TOOLBAR_MIN_HEIGHT,
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    left: 0,
    zIndex: theme.zIndex.appBar,
  },
}));

// Panel toolbar should be added to any panel that's part of the
// react-mosaic layout.  It adds a drag handle, remove/replace controls
// and has a place to add custom controls via it's children property
export default React.memo<Props>(function PanelToolbar({
  additionalIcons,
  backgroundColor,
  children,
  isUnknownPanel = false,
}: Props) {
  const { classes } = useStyles();
  const { isFullscreen, exitFullscreen } = useContext(PanelContext) ?? {};
  const [menuOpen, setMenuOpen] = useState(false);

  const panelContext = useContext(PanelContext);

  // Help-shown state must be hoisted outside the controls container so the modal can remain visible
  // when the panel is no longer hovered.
  const additionalIconsWithHelp = useMemo(() => {
    return (
      <>
        {additionalIcons}
        {isFullscreen === true && (
          <ToolbarIconButton
            value="exit-fullscreen"
            title="Exit fullscreen"
            onClick={exitFullscreen}
          >
            <FullscreenExitIcon />
          </ToolbarIconButton>
        )}
      </>
    );
  }, [additionalIcons, isFullscreen, exitFullscreen]);

  // If we have children then we limit the drag area to the controls. Otherwise the entire
  // toolbar is draggable.
  const rootDragRef =
    isUnknownPanel || children != undefined ? undefined : panelContext?.connectToolbarDragHandle;

  const controlsDragRef =
    isUnknownPanel || children == undefined ? undefined : panelContext?.connectToolbarDragHandle;

  return (
    <div
      className={classes.root}
      data-testid="mosaic-drag-handle"
      ref={rootDragRef}
      style={{
        backgroundColor,
        cursor: rootDragRef != undefined ? "grab" : "auto",
      }}
    >
      {children ??
        (panelContext != undefined && (
          <Typography noWrap variant="body2" color="text.secondary" flex="auto">
            {panelContext.title}
          </Typography>
        ))}
      <PanelToolbarControls
        additionalIcons={additionalIconsWithHelp}
        isUnknownPanel={!!isUnknownPanel}
        menuOpen={menuOpen}
        ref={controlsDragRef}
        setMenuOpen={setMenuOpen}
      />
    </div>
  );
});
