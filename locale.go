package main

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
)

var messages map[string]string

func Load(lang string) error {
	file, err := os.ReadFile("frontend/src/locales/" + lang + ".json")
	if err != nil {
		return err
	}
	return json.Unmarshal(file, &messages)
}

func T(key string, data map[string]string) string {
	tmpl, ok := messages[key]
	if !ok {
		return key
	}

	return Interpolate(tmpl, data)
}

var re = regexp.MustCompile(`\{\{\s*(\w+)\s*\}\}`)

func Interpolate(text string, values map[string]string) string {
	return re.ReplaceAllStringFunc(text, func(match string) string {
		key := re.FindStringSubmatch(match)[1]
		if v, ok := values[key]; ok {
			fmt.Println(v, ok)
			return v
		}
		return match
	})
}
