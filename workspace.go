package main

import (
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) OpenWorkspace(dirPath string) {
	dir := filepath.Base(dirPath)
	workspace = dir
	runtime.EventsEmit(a.ctx, "workspace", workspace)

	nodes := getJsonFileContent("nodes.json")
	runtime.EventsEmit(a.ctx, "nodes", nodes)

	edges := getJsonFileContent("edges.json")
	runtime.EventsEmit(a.ctx, "edges", edges)
}
