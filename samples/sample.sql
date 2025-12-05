WITH cte AS (
    SELECT a.Id, a.Name, b.Value
    FROM dbo.TableA a INNER JOIN dbo.TableB b ON a.Id = b.AId
    WHERE b.Value > 10
)
SELECT a.Id, a.Name, cte.Value, COUNT(*) AS Cnt
FROM dbo.TableA a
LEFT JOIN cte ON cte.Id = a.Id
GROUP BY a.Id, a.Name, cte.Value
ORDER BY a.Name;