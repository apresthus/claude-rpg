CXX = clang++
CXXFLAGS = -std=c++20 -O3 -Wall -Wextra -I./lib -I./src
LDFLAGS = -lcurl

TARGET = rpg
BUILD_DIR = build
SRC_DIR = src

SRCS = $(SRC_DIR)/main.cpp \
       $(SRC_DIR)/api/claude_api.cpp \
       $(SRC_DIR)/api/gemini_api.cpp \
       $(SRC_DIR)/server/routes.cpp \
       $(SRC_DIR)/context/context_manager.cpp \
       $(SRC_DIR)/parser/response_parser.cpp \
       $(SRC_DIR)/parser/markdown_parser.cpp

OBJS = $(SRCS:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CXXFLAGS) -c -o $@ $<

clean:
	rm -rf $(BUILD_DIR) $(TARGET)

.PHONY: all clean
