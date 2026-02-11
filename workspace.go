package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) OpenWorkspace(dirPath string) {
	dir := filepath.Base(dirPath)
	workspace = dir
	runtime.EventsEmit(a.ctx, "workspace", workspace)

	nodesFilePath := filepath.Join(dirPath, "nodes.json")
	jsonFile, err := os.Open(nodesFilePath)
	if err != nil {
		fmt.Println("JSONファイルを開けません", err)
		return
	}
	defer jsonFile.Close()

	jsonData, err := io.ReadAll(jsonFile)
	if err != nil {
		fmt.Println("JSONデータを読み込めません", err)
		return
	}
	fmt.Println("読み込んだJSONデータ:", string(jsonData))
	nodes = string(jsonData)
	runtime.EventsEmit(a.ctx, "nodes", string(jsonData))
}
