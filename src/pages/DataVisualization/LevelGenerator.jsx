import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber, Upload, message, Card, Spin, Tooltip, Typography, Space, Divider } from 'antd';
import { UploadOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import './DataVisualization.css';
import api from '../../api';


const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const LevelGenerator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedLevel, setGeneratedLevel] = useState(null);
  const [jsonString, setJsonString] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [wordsLoading, setWordsLoading] = useState(false);

  // Sample response for demonstration
  const sampleResponse = {
    "rows": 7,
    "cols": 7,
    "hint": "ENTRETENIMIENTO EN EL PATIO TRASERO",
    "words": ["COMETA", "BALÓN", "CARPA", "VÓLEI", "DARDO", "GOLF"],
    "boardCharacters": [
      ["O", "D", "R", "A", "D", "D", "O"],
      ["G", "C", "A", "R", "P", "A", "I"],
      ["Ó", "C", "G", "V", "G", "T", "E"],
      ["B", "V", "O", "B", "O", "E", "L"],
      ["B", "A", "L", "Ó", "N", "M", "Ó"],
      ["B", "V", "F", "D", "Ó", "O", "V"],
      ["B", "Ó", "A", "O", "G", "C", "C"]
    ],
    "wordPlacements": [
      {"word": "COMETA", "row": 6, "col": 5, "h": 0, "v": -1},
      {"word": "BALÓN", "row": 4, "col": 0, "h": 1, "v": 0},
      {"word": "CARPA", "row": 1, "col": 1, "h": 1, "v": 0},
      {"word": "VÓLEI", "row": 5, "col": 6, "h": 0, "v": -1},
      {"word": "DARDO", "row": 0, "col": 4, "h": -1, "v": 0},
      {"word": "GOLF", "row": 2, "col": 2, "h": 0, "v": 1}
    ],
    "randomLetters": ["D", "B", "C", "A", "G", "V", "O", "Ó"]
  };

  useEffect(() => {
    setGeneratedLevel(sampleResponse);
    setJsonString(JSON.stringify(sampleResponse, null, 2));
  }, []);

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' }
  ];
  const handleGenerateHint = async () => {
    try {
      setHintLoading(true);
      const language = form.getFieldValue('language');
      const response = await api.post('/v1/bigquery/generate-hint', {
        language: language
      });
      
      if (response.data && response.data.data.hint) {
        form.setFieldsValue({ hint: response.data.data.hint });
        message.success('Hint generated successfully!');
      } else {
        message.error('Failed to generate hint');
      }
    } catch (error) {
      console.error('Error generating hint:', error);
      message.error('Failed to generate hint: ' + (error.message || 'Please try again.'));
    } finally {
      setHintLoading(false);
    }
  };
  const handleGenerateWords = async () => {
    try {
      setWordsLoading(true);
      const numWords = form.getFieldValue('numWords') || 6;
      const hint = form.getFieldValue('hint');
      if (!hint) {
        message.warning('Please enter a hint first or generate one');
        setWordsLoading(false);
        return;
      }
      
      const response = await api.post('/v1/bigquery/generate-words', {
        hint: hint,
        count: numWords.toString()
      });
      
      if (response.data && response.data.success && response.data.data && response.data.data.words) {
        form.setFieldsValue({ 
          englishLevel: response.data.data.words.join(', ')
        });
        message.success('Words generated successfully!');
      } else {
        message.error('Failed to generate words');
      }
    } catch (error) {
      console.error('Error generating words:', error);
      message.error('Failed to generate words: ' + (error.message || 'Please try again.'));
    } finally {
      setWordsLoading(false);
    }
  };
  const handleGenerateLevel = async (values) => {
    setLoading(true);
    try {
      const words = values.englishLevel.split(',').map(word => word.trim());
      let translatedWords = [...words]; // Default to original words
    
      // Translate each word to the target language
      try {
        const translatedWordsPromises = words.map(async (word) => {
          const translationResponse = await api.post('/v1/bigquery/translate-text', {
            text: word,
            targetLanguage: values.language,
            content_type: "",
            narrator_gender: "neutral",
            additional_context: ""
          });
          console.log(translationResponse);
          
          if (translationResponse.data && translationResponse.data.data) {
            return translationResponse.data.data.finalGptTranslation.toUpperCase();
          }
          return word; // Fallback to original word if translation fails
        });
        translatedWords = await Promise.all(translatedWordsPromises);
        console.log(translatedWords);
    } catch (translationError) {
      console.error('Error translating words:', translationError);
      message.warning('Could not translate words. Using original words instead.');
    }
    let translatedHint = values.hint;
    try {
      const hintTranslationResponse = await api.post('/v1/bigquery/translate-text', {
        text: values.hint,
        targetLanguage: values.language,
        content_type: "",
        narrator_gender: "neutral",
        additional_context: ""
      });
      
      if (hintTranslationResponse.data && hintTranslationResponse.data.data) {
        translatedHint = hintTranslationResponse.data.data.finalGptTranslation.toUpperCase();
      }
    } catch (hintTranslationError) {
      console.error('Error translating hint:', hintTranslationError);
      message.warning('Could not translate hint. Using original hint instead.');
    }
    let rows, cols;
    switch(values.difficulty) {
      case 'easy':
        rows = 7;
        cols = 8;
        break;
      case 'medium':
        rows = 9;
        cols = 10;
        break;
      case 'hard':
        rows = 10;
        cols = 11;
        break;
      default:
        rows = 7;
        cols = 8;
    }

      const formattedData = {
        "1": [
          {
            "original_hint": values.hint,
            "translated_hint": translatedHint,
            "words":translatedWords 
          },
          translatedWords.length,
          rows,
          cols
        ]
      };
      
      // Make the API call
      const response = await api.post('/v1/bigquery/generateJson', {
        formattedWordLevels: formattedData
      });
      if (response.data && response.data.levels && response.data.levels.levels && response.data.levels.levels["1"]) {
        const levelData = response.data.levels.levels["1"];
        setGeneratedLevel(levelData);
        setJsonString(JSON.stringify(levelData, null, 2));
      } else {
        message.error('Invalid response format from the API');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error generating level:', error);
      message.error('Failed to generate level: ' + (error.message || 'Please try again.'));
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    message.success('JSON copied to clipboard!');
  };

  const handleReset = () => {
    form.resetFields();
    // Don't reset the generated level, keep the sample
  };

  // Function to check if a cell contains a word
  const isCellInWord = (row, col) => {
    if (!generatedLevel) return false;
    
    return generatedLevel.wordPlacements.some(placement => {
      const { word, row: startRow, col: startCol, h, v } = placement;
      
      for (let i = 0; i < word.length; i++) {
        const currentRow = startRow + (i * v);
        const currentCol = startCol + (i * h);
        
        if (currentRow === row && currentCol === col) {
          return true;
        }
      }
      
      return false;
    });
  };

  // Function to get the word for a cell
  const getWordForCell = (row, col) => {
    if (!generatedLevel) return null;
    
    for (const placement of generatedLevel.wordPlacements) {
      const { word, row: startRow, col: startCol, h, v } = placement;
      
      for (let i = 0; i < word.length; i++) {
        const currentRow = startRow + (i * v);
        const currentCol = startCol + (i * h);
        
        if (currentRow === row && currentCol === col) {
          return word;
        }
      }
    }
    
    return null;
  };

  return (
    <div className="level-generator-container">
      <div className="level-generator-header">
        <Text className="level-generator-subtitle">
          Generate word search puzzles for your game with customizable settings
          in seconds.
        </Text>
      </div>

      <div className="level-generator-content">
        <div className="level-generator-form-container">
          <Card title="Level Configuration" className="level-generator-card">

            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerateLevel}
              initialValues={{
                rows: 7,
                cols: 7,
                language: "es",
                englishLevel: "KITE, BALL, TENT, VOLLEY, DART, GOLF",
                hint: "BACKYARD ENTERTAINMENT",
              }}
            >
                          <Form.Item
              name="language"
              label="Target Language"
              rules={[{ required: true, message: "Please select a language" }]}
            >
              <Select placeholder="Select language">
                {languages.map((lang) => (
                  <Option key={lang.value} value={lang.value}>
                    {lang.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="hint"
              label="Hint"
              rules={[{ required: true, message: "Please enter a hint" }]}
            >
              <Input
                placeholder="Enter a hint for the level (e.g. BACKYARD ENTERTAINMENT)"
                addonAfter={
                  <Button
                    type="text"
                    onClick={handleGenerateHint}
                    loading={hintLoading}
                    style={{ padding: 0, border: "none", color: "white" }}
                  >
                    Generate
                  </Button>
                }
              />
            </Form.Item>
              <Form.Item
                name="englishLevel"
                label="English Level"
                rules={[
                  {
                    required: true,
                    message: "Please enter the English level words",
                  },
                ]}
              >
                <TextArea
                  placeholder="Enter words separated by commas (e.g. KITE, BALL, TENT, VOLLEY, DART, GOLF)"
                  rows={4}
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Form.Item
                    name="numWords"
                    label="Number of Words"
                    rules={[
                      {
                        required: true,
                        message: "Please enter number of words",
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber min={3} max={12} />
                  </Form.Item>

                  <Button
                    type="default"
                    onClick={handleGenerateWords}
                    loading={wordsLoading}
                    style={{ marginTop: "30px" }}
                  >
                    Generate Words
                  </Button>
                </Space>
              </Form.Item>

              <div style={{ display: "flex", gap: "16px" }}>
                <Form.Item
                  name="difficulty"
                  label="Difficulty Level"
                  rules={[
                    {
                      required: true,
                      message: "Please select a difficulty level",
                    },
                  ]}
                >
                  <Select placeholder="Select difficulty">
                    <Option value="easy">Easy (7×8)</Option>
                    <Option value="medium">Medium (9×10)</Option>
                    <Option value="hard">Hard (10×11)</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="generate-button"
                  >
                    Generate Level
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    Reset Form
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>

        <div className="level-generator-result-container">
          {loading ? (
            <div className="level-generator-loading">
              <Spin size="large" />
              <Text>Generating word level...</Text>
            </div>
          ) : generatedLevel ? (
            <Card
              title="Generated Level"
              className="level-generator-card"
              extra={
                <Space>
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={handleCopyJson}
                    className="text-white"
                  >
                    Copy JSON
                  </Button>
                  {downloadUrl && (
                    <Button
                      type="primary"
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Generated JSON
                    </Button>
                  )}
                </Space>
              }
            >
              <div className="level-result">
                <div className="level-info">
                  <div className="level-details">
                    <div className="level-detail-item">
                      <Text strong className="text-white">
                        Hint:
                      </Text>
                      <Text className="text-white">{generatedLevel.hint}</Text>
                    </div>
                    <div className="level-detail-item">
                      <Text strong className="text-white">
                        Words:
                      </Text>
                      <div className="word-tags">
                        {generatedLevel.words.map((word, index) => (
                          <div key={index} className="word-tag">
                            {word}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="level-detail-item">
                      <Text strong className="text-white">
                        Grid Size:
                      </Text>
                      <Text className="text-white">
                        {generatedLevel.rows} × {generatedLevel.cols}
                      </Text>
                    </div>
                  </div>

                  <Divider style={{ margin: "16px 0" }} />

                  <div className="json-preview">
                    <div className="json-header">
                      <Text strong className="text-white">
                        JSON Output:
                      </Text>
                    </div>
                    <pre className="json-content">{jsonString}</pre>
                  </div>
                </div>

                <div className="grid-visualization">
                  <div className="grid-title">Word Search Grid</div>
                  <div
                    className="word-grid"
                    style={{
                      gridTemplateColumns: `repeat(${generatedLevel.cols}, 1fr)`,
                      gridTemplateRows: `repeat(${generatedLevel.rows}, 1fr)`,
                    }}
                  >
                    {generatedLevel.boardCharacters.map((row, rowIndex) =>
                      row.map((cell, colIndex) => {
                        const isPartOfWord = isCellInWord(rowIndex, colIndex);
                        const word = getWordForCell(rowIndex, colIndex);

                        return (
                          <Tooltip
                            key={`${rowIndex}-${colIndex}`}
                            title={isPartOfWord ? `Part of: ${word}` : null}
                            placement="top"
                          >
                            <div
                              className={`grid-cell ${
                                isPartOfWord ? "word-cell" : ""
                              }`}
                            >
                              {cell}
                            </div>
                          </Tooltip>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="level-generator-card empty-state" bordered={false}>
              <div className="empty-state-content">
                <div className="empty-icon">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="20"
                      y="20"
                      width="80"
                      height="80"
                      rx="4"
                      stroke="#8C8C8C"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M40 40H80M40 60H80M40 80H60"
                      stroke="#8C8C8C"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <Title level={4}>No Level Generated Yet</Title>
                <Text type="secondary">
                  Configure your level settings and click "Generate Level" to
                  create a word search puzzle.
                </Text>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelGenerator;