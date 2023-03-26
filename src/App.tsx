import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button, Textarea, Card, Title, Text } from "@mantine/core";
import Markdown from "react-markdown";

// debounce method from https://davidwalsh.name/javascript-debounce-function
function debounce(func: any, wait: number, immediate?: boolean) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [result, setResult] = useState();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    // make an event for handling the command enter or control enter keys
    window.addEventListener("keydown", (e) => {
      if (
        (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
        e.keyCode === 13 &&
        !isLoading
      ) {
        // do something
        handleBuildRecipe();
      }
    });

    return () => {
      window.removeEventListener("keydown", event);
    };
  }, []);
  const field = useRef("");

  const handleBuildRecipe = debounce(
    () => {
      setIsLoading(true);
      axios
        .post(`${API_URL}/api/recipe`, { question: field.current })
        .then((res) => {
          setResult(res.data.msg.completion);
          setIsLoading(false);
        });
    },
    500,
    false
  );

  return (
    <>
      <Card style={{ maxWidth: 635 }}>
        <Title style={{ marginBottom: 10 }}>Recipe Generator</Title>
        <Textarea
          placeholder="What what would you like to make?"
          label="Your recipe"
          withAsterisk
          style={{ maxWidth: 600, marginBottom: 10 }}
          onChange={(e) => {
            field.current = e.target.value;
          }}
        />
        <Text fz="xs">
          Keep in mind, you can ask me for any recipe. You can tell me what
          ingredients you have on hand, how many people you're cooking for, a
          theme, and many other things.
        </Text>
        <Button
          loading={isLoading}
          disabled={isLoading}
          style={{ marginTop: 20, marginBottom: 40 }}
          onClick={handleBuildRecipe}
        >
          Let's go!
        </Button>
      </Card>
      {result && !isLoading && (
        <Card style={{ maxWidth: 635, marginTop: 40 }}>
          <Title style={{ marginBottom: 10 }}>Your recipe</Title>
          <Markdown>{result}</Markdown>
        </Card>
      )}
    </>
  );
}

export default App;
