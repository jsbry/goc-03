package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

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
	case edgesFile, commentsFile:
	}
	return string(jsonData)
}
