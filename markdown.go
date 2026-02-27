package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const mdTemplate = "# %s\n"

func (a *App) OpenMarkdown(nodeName string) {
	if workspaceFullPath == "" {
		return
	}

	filepath := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", nodeName))

	isNewFile := true
	file, err := os.OpenFile(filepath, os.O_CREATE|os.O_EXCL, 0666)
	if err != nil {
		if errors.Is(err, os.ErrExist) {
			file, err = os.OpenFile(filepath, os.O_RDONLY|os.O_APPEND, 0666)
			if err != nil {
				panic(err)
			}
			isNewFile = false
		} else {
			panic(err)
		}
	}
	defer file.Close()

	content := ""
	if isNewFile {
		content = fmt.Sprintf(mdTemplate, nodeName)
		_, err := file.WriteString(content)
		if err != nil {
			panic(err)
		}
	} else {
		var builder strings.Builder
		buf := make([]byte, 4096)
		for {
			n, err := file.Read(buf)
			if n > 0 {
				builder.Write(buf[:n])
			}
			if err == io.EOF {
				break
			}
			if err != nil {
				panic(err)
			}
		}
		content = builder.String()
	}
	runtime.EventsEmit(a.ctx, "content", content)
}

func (a *App) RenameMarkdown(oldLabel string, newLabel string) {
	if workspaceFullPath == "" {
		return
	}

	old := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", oldLabel))
	new := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", newLabel))

	err := os.Rename(old, new)
	if err != nil {
		fmt.Printf("Failed to rename file from %s to %s: %v\n", old, new, err)
		return
	}
	fmt.Printf("Renamed file from %s to %s\n", old, new)
}

func (a *App) RemoveMarkdown(label string) {
	if workspaceFullPath == "" {
		return
	}

	filepath := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", label))

	err := os.Remove(filepath)
	if err != nil {
		fmt.Printf("Failed to remove file %s: %v\n", filepath, err)
		return
	}
	fmt.Printf("Removed file %s\n", filepath)
}

func (a *App) SaveMarkdown(nodeName string, content string) {
	if workspaceFullPath == "" {
		return
	}

	filepath := filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", nodeName))

	content = strings.ReplaceAll(content, "\r\n", "\n")
	content = strings.ReplaceAll(content, "\r", "\n")

	err := os.WriteFile(filepath, []byte(content), 0666)
	if err != nil {
		fmt.Printf("Failed to save file %s: %v\n", filepath, err)
		return
	}
	fmt.Printf("Saved file %s\n", filepath)
}

func (a *App) GetWalkDir() (string, error) {
	if workspaceFullPath == "" {
		return "[]", nil
	}

	expectedFiles := make(map[string]bool)
	for _, v := range a.nodes {
		expectedFiles[v.Data.Label] = true
	}
	fmt.Println("Expected files:", expectedFiles)

	var files []string
	err := filepath.Walk(workspaceFullPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".md") && !expectedFiles[strings.TrimSuffix(info.Name(), ".md")] {
			files = append(files, withoutExt(info.Name()))

		}
		return nil
	})
	if err != nil {
		fmt.Printf("Error walking the path %s: %v\n", workspaceFullPath, err)
		return "[]", err
	}
	// fmt.Println("GetWalkDir files:", files)

	if len(files) == 0 {
		return "[]", nil
	}

	jsonBytes, err := json.Marshal(files)
	if err != nil {
		fmt.Printf("Error marshaling files: %v\n", err)
		return "[]", err
	}
	// fmt.Printf("GetWalkDir JSON: %s\n", string(jsonBytes))
	return string(jsonBytes), nil
}

func withoutExt(filename string) string {
	return filepath.Base(filename[:len(filename)-len(filepath.Ext(filename))])
}
