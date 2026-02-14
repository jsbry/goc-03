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
	err := saveJsonFileContent("nodes.json", jsonData)
	if err != nil {
		fmt.Println("Error saving nodes:", err)
		return
	}
	runtime.EventsEmit(a.ctx, "nodes", jsonData)
}

func (a *App) SaveEdges(jsonData string) {
	fmt.Println("SaveEdges called", jsonData)
	err := saveJsonFileContent("edges.json", jsonData)
	if err != nil {
		fmt.Println("Error saving edges:", err)
		return
	}
	runtime.EventsEmit(a.ctx, "edges", jsonData)
}

func saveJsonFileContent(filename string, jsonData string) error {
	path := filepath.Join(workspace, filename)
	jsonByte := []byte(jsonData)
	if isDebug {
		var buf bytes.Buffer
		err := json.Indent(&buf, []byte(jsonData), "", "  ")
		if err != nil {
			fmt.Println("Failed to indent JSON:", err)
			return err
		}
		jsonByte = buf.Bytes()
	}

	os.WriteFile(path, jsonByte, 0644)
	return nil
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

func (a *App) OpenFileDialog() string {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select an image",
		Filters: []runtime.FileFilter{
			{DisplayName: "Images", Pattern: "*.png;*.jpg;*.jpeg"},
		},
	})
	if err != nil {
		fmt.Println("Error selecting image:", err)
		return ""
	}
	fmt.Println("Selected image path:", path)
	return path
}
