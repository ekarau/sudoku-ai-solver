NAME = stats_server
CXX = g++

CXXFLAGS = -Wall -Wextra -Werror
CXXFLAGS += -std=c++17
CXXFLAGS += -Wno-type-limits
CXXFLAGS += -I./tools
CXXFLAGS += -DASIO_STANDALONE

LDFLAGS = -lpthread
LDFLAGS += -lpqxx
LDFLAGS += -lpq
LDFLAGS += -lsoci_core
LDFLAGS += -lsoci_postgresql
LDFLAGS += -lcurl

SRCS = $(filter-out srcs/repository_orm.cpp, $(wildcard srcs/*.cpp))
OBJS = $(SRCS:.cpp=.o)


all: $(NAME)

orm: $(NAME_ORM)

$(NAME): $(OBJS)
	$(CXX) $(CXXFLAGS) $(OBJS) -o $(NAME) $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

$(NAME_ORM): $(OBJS_ORM)
	$(CXX) $(CXXFLAGS) $(OBJS_ORM) -o $(NAME_ORM) $(LDFLAGS)

clean:
	rm -f $(OBJS) $(OBJS_ORM)

fclean: clean
	rm -f $(NAME) $(NAME_ORM)

re: fclean all

.PHONY: all clean fclean re
