package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

func saveJsonFileContent(filename string, jsonData string) error {
	if workspaceFullPath == "" {
		return nil
	}

	path := filepath.Join(workspaceFullPath, filename)
	formatted, err := formatJson([]byte(jsonData))
	if err != nil {
		fmt.Println("Error formatting JSON:", err)
		return err
	}
	jsonByte := []byte(formatted)

	fmt.Println("Saving JSON to:", path)
	err = os.WriteFile(path, jsonByte, 0644)
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

func formatJson(jsonByte []byte) ([]byte, error) {
	var raw []json.RawMessage
	if err := json.Unmarshal(jsonByte, &raw); err != nil {
		return nil, err
	}

	var b strings.Builder
	b.WriteString("[\n")

	for i, r := range raw {
		b.WriteString("  ")
		b.Write(r)
		if i != len(raw)-1 {
			b.WriteString(",")
		}
		b.WriteString("\n")
	}

	b.WriteString("]")
	return []byte(b.String()), nil
}
