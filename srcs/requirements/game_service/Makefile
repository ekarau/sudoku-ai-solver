NAME        = game_service
CXX         = g++
# Flags including our tools folder and standalone Asio mode
CXXFLAGS    = -Wall -Wextra -Werror -Wno-type-limits -std=c++17 -I./tools -DASIO_STANDALONE
# Linker Flags (PostgreSQL kütüphaneleri eklendi)
LDFLAGS     = -lpthread -lpqxx -lpq

# Locate all source files in the srcs/ directory
SRCS        = $(wildcard srcs/*.cpp)
# Shorthand to change .cpp to .o
OBJS        = $(SRCS:.cpp=.o)

all: $(NAME)

$(NAME): $(OBJS)
	$(CXX) $(CXXFLAGS) $(OBJS) -o $(NAME) $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS)

fclean: clean
	rm -f $(NAME)

re: fclean all

run: $(NAME)
	./$(NAME)

.PHONY: all clean fclean re run