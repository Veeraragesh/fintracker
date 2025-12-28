
            {/* <Box>
                <select value={filterExpenses} onChange={(e) => setFilterExpenses(e.target.value)}>
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="last6Months">Last 6 Months</option>
                    <option value="lastYear">Last Year</option>
                    <option value="last5Years">Last 5 Years</option>
                </select>

                <h3>Expense</h3>
                <ul>
                    {filteredDataExpenses.map(item => (
                        <li key={item.id}>{item.category} — {item.transactionDate}</li>
                    ))}
                </ul>
            </Box>


            <Box>

                <h3>Income</h3>

                <select value={filterIncomes} onChange={(e) => setFilterIncomes(e.target.value)}>
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="last6Months">Last 6 Months</option>
                    <option value="lastYear">Last Year</option>
                    <option value="last5Years">Last 5 Years</option>
                </select>

                <Button onClick={() => setTransactionMode(transactionMode === "expense" ? "income" : "expense")}>
                    Change Mode
                </Button>

                <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2, boxShadow: 3 }}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ textAlign: "center", mb: 2 }}
                        >
                            Category-wise Expense Distribution
                        </Typography>
                        <Doughnut data={chartData} options={options} />
                    </CardContent>
                </Card>


            </Box> */}


            
            <Grid
                container
                spacing={3}
                sx={{
                    width: "100%",               // ✅ fill entire Box
                    px: isSmall ? 2 : 4,         // small padding for breathing room
                    boxSizing: "border-box",
                }}
            >                    {/* LEFT GRID */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            height: "80vh",
                            borderRadius: 3,
                            p: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="h6" color="text.secondary">
                            Left Grid (for stats, summary, etc.)
                        </Typography>
                    </Paper>
                </Grid>

                {/* RIGHT GRID */}
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            height: "80vh",
                            borderRadius: 3,
                            p: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {/* Tabs */}
                        <Tabs
                            value={transactionMode}
                            onChange={(e, newValue) => setTransactionMode(newValue)}
                            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab label="Expenses" value="expense" />
                            <Tab label="Income" value="income" />
                        </Tabs>

                        {/* Dropdown Filter */}
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Date Range</InputLabel>
                            <Select
                                value={dateFilter}
                                label="Date Range"
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <MenuItem value="today">Today</MenuItem>
                                <MenuItem value="thisWeek">This Week</MenuItem>
                                <MenuItem value="thisMonth">This Month</MenuItem>
                                <MenuItem value="last6Months">Last 6 Months</MenuItem>
                                <MenuItem value="lastYear">Last Year</MenuItem>
                                <MenuItem value="last5Years">Last 5 Years</MenuItem>
                                <MenuItem value="all">All</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Chart */}
                        <Box sx={{ minHeight: 300 }}>
                            <Doughnut data={chartData} options={options} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>