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

type Node struct {
	ID       string        `json:"id"`
	Type     string        `json:"type,omitempty"`
	Position Position      `json:"position"`
	Data     ImageNodeData `json:"data"`
	Width    float64       `json:"width,omitempty"`
	Height   float64       `json:"height,omitempty"`
	Selected bool          `json:"selected,omitempty"`
	Dragging bool          `json:"dragging,omitempty"`
}

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type ImageNodeData struct {
	Label    string `json:"label"`
	ImageURL string `json:"imageUrl"`
}

func (a *App) SaveNodes(jsonData string) {
	fmt.Println("SaveNodes called", jsonData)
	err := saveJsonFileContent(nodesFile, jsonData)
	if err != nil {
		fmt.Println("Error saving nodes:", err)
		return
	}
	runtime.EventsEmit(a.ctx, "nodes", jsonData)
}

func (a *App) SaveEdges(jsonData string) {
	fmt.Println("SaveEdges called", jsonData)
	err := saveJsonFileContent(edgesFile, jsonData)
	if err != nil {
		fmt.Println("Error saving edges:", err)
		return
	}
	runtime.EventsEmit(a.ctx, "edges", jsonData)
}

func saveJsonFileContent(filename string, jsonData string) error {
	if workspaceFullPath == "" {
		return nil
	}

	path := filepath.Join(workspaceFullPath, filename)
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

	fmt.Println("Saving JSON to:", path)
	err := os.WriteFile(path, jsonByte, 0644)
	if err != nil {
		fmt.Println("Error writing JSON file:", err)
		return err
	}
	return nil
}

func (a *App) getJsonFileContent(filePath string) string {
	if workspaceFullPath == "" {
		return "[]"
	}

	path := filepath.Join(workspaceFullPath, filePath)
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
	// fmt.Println("jsonData:", string(jsonData))

	switch filePath {
	case nodesFile:
		err = json.Unmarshal(jsonData, &a.nodes)
		if err != nil {
			fmt.Println("Error unmarshalling nodes JSON:", err)
			return "[]"
		}
	case edgesFile:
	}
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
