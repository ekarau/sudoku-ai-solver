FROM debian:bookworm AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    unzip \
    ca-certificates \
    libpq-dev \
    libpqxx-dev \
    libsoci-dev \
    libboost-all-dev \
    libcurl4-openssl-dev \
    nlohmann-json3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p tools

RUN wget https://github.com/chriskohlhoff/asio/archive/refs/tags/asio-1-30-2.tar.gz -O asio.tar.gz \
    && tar -xzf asio.tar.gz \
    && mv asio-asio-1-30-2/asio/include/* ./tools/ \
    && rm -rf asio.tar.gz asio-asio-1-30-2

RUN wget https://github.com/CrowCpp/Crow/releases/download/v1.2.0/crow_all.h -O ./tools/crow_all.h

COPY ./srcs ./srcs
COPY Makefile .

RUN make

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libstdc++6 \
    libpq5 \
    libpqxx-dev \
    libcurl4 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/stats_server .

EXPOSE 8090
CMD ["./stats_server"]