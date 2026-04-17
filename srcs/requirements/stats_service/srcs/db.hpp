#pragma once

#include "includes.hpp"

namespace stats
{
    std::string get_conn_string();
    bool init_db(int retries, int wait_ms);
}
