package main

import (
	"os"
	"path/filepath"
)

func (a *App) SaveNodes(jsonData string) {
	nodesFilePath := filepath.Join(workspace, "nodes.json")
	os.WriteFile(nodesFilePath, []byte(jsonData), 0644)
}
