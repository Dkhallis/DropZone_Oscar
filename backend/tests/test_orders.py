"""Orders: a pair is sold only from a live drop, and never twice."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from tests.conftest import iso


def order(client: TestClient, drop_id: int):
    return client.post(f"/drops/{drop_id}/orders")


def test_an_order_decrements_the_stock(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=10)

    response = order(client, drop["id"])

    assert response.status_code == 201
    body = response.json()
    assert body["drop_id"] == drop["id"]
    assert body["drop"]["remaining"] == 9
    assert body["drop"]["status"] == "live"
    assert client.get(f"/drops/{drop['id']}").json()["remaining"] == 9


def test_the_last_pair_makes_the_drop_sold_out(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=1)

    response = order(client, drop["id"])

    assert response.status_code == 201
    assert response.json()["drop"]["remaining"] == 0
    assert response.json()["drop"]["status"] == "sold_out"


def test_the_last_pair_is_never_sold_twice(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=2)

    statuses = [order(client, drop["id"]).status_code for _ in range(3)]

    assert statuses == [201, 201, 409]
    assert client.get(f"/drops/{drop['id']}").json()["remaining"] == 0


def test_ordering_a_sold_out_drop_is_refused(client: TestClient, make_drop) -> None:
    drop = make_drop(stock=1)
    order(client, drop["id"])

    response = order(client, drop["id"])

    assert response.status_code == 409
    assert response.json()["detail"] == f"Le drop {drop['id']} est épuisé"


def test_ordering_an_upcoming_drop_is_refused(client: TestClient, make_drop) -> None:
    drop = make_drop(opens_at=iso(datetime.now(UTC) + timedelta(days=1)), stock=5)

    response = order(client, drop["id"])

    assert response.status_code == 409
    assert response.json()["detail"] == f"Le drop {drop['id']} n'est pas encore ouvert"
    assert client.get(f"/drops/{drop['id']}").json()["remaining"] == 5


def test_ordering_an_unknown_drop_returns_404(client: TestClient) -> None:
    response = order(client, 999)

    assert response.status_code == 404
    assert response.json()["detail"] == "Drop 999 introuvable"
