package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) SaveNodes(jsonData string) {
	fmt.Println("SaveNodes called", jsonData)
	nodesFilePath := filepath.Join(workspace, "nodes.json")
	jsonByte := []byte(jsonData)
	if isDebug {
		var buf bytes.Buffer
		err := json.Indent(&buf, []byte(jsonData), "", "  ")
		if err != nil {
			panic(err)
		}
		jsonByte = buf.Bytes()
	}

	os.WriteFile(nodesFilePath, jsonByte, 0644)
	runtime.EventsEmit(a.ctx, "nodes", jsonData)
}

func (a *App) SaveEdges(jsonData string) {
	fmt.Println("SaveEdges called", jsonData)
	edgesFilePath := filepath.Join(workspace, "edges.json")

	jsonByte := []byte(jsonData)
	if isDebug {
		var buf bytes.Buffer
		err := json.Indent(&buf, []byte(jsonData), "", "  ")
		if err != nil {
			panic(err)
		}
		jsonByte = buf.Bytes()
	}

	os.WriteFile(edgesFilePath, jsonByte, 0644)
	runtime.EventsEmit(a.ctx, "edges", jsonData)
}

func getJsonFileContent(filePath string) string {
	path := filepath.Join(workspace, filePath)
	jsonFile, err := os.Open(path)
	if err != nil {
		fmt.Println("Error opening JSON file:", err)
		return "[]"
	}
	defer jsonFile.Close()

	jsonData, err := io.ReadAll(jsonFile)
	if err != nil {
		fmt.Println("Error reading JSON file:", err)
		return "[]"
	}
	fmt.Println("jsonData:", string(jsonData))
	return string(jsonData)
}
