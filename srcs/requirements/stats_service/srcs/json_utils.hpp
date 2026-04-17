#pragma once

#include "includes.hpp"
#include "repository.hpp"

namespace stats
{
    crow::json::wvalue bucket_to_json(const Bucket &b);
    crow::json::wvalue stats_to_json(const std::string &username,
                                     const std::vector<StatsRow> &rows);
    crow::json::wvalue match_to_json(const MatchEntry &me);
    crow::json::wvalue history_to_json(const std::string &username,
                                       const std::vector<MatchEntry> &entries);
    crow::response     make_error(int code, const std::string &msg);
}
